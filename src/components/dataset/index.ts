import {useApiClient} from "../../services/api.service";
import {EventEmitter} from "events";
import {FieldInterface} from "../../model/field";

export declare type StandardQueryOperator =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>'
    | '>='
    | 'exists'
    | '!exists'
    | 'between'
    | '!between'
    | 'like'
    | '!like'
    | 'in'
    | '!in'
    | 'contains'
    | '!contains'
    | 'empty'
    | '!empty'

export interface FilterItemInterface {
    key: string
    op: StandardQueryOperator
    compare?: any
    compare_2?: any
}

export class GetDataManyRequestDto {
    filter?: FilterItemInterface[]
    filterBy?:string
    searchBy?:string[]
    fields?: string[]
    query?: string
    limit?: number = 100
    offset?: number = 0
    sort?: string[]
    parentId?: string
}

export interface DataSetParamsInterface {
    datasource: string
    alias: string,
    fields?: string[]
}

export class ResponseDto {
    statusCode: number
    error?: string
    message?: string[]
}

export class GetDataManyResponseDto extends ResponseDto {
    items: any[]
    count: number
}

export interface DataSetInterface extends EventEmitter {
    props: DataSetParamsInterface
    totalCount : number
    page
    allDataLoaded: boolean
    items: any[]
    sort: string[]
    isLoading: boolean
    search: string

    loadNext: (reset: boolean) => Promise<void>

    getFields: () => Promise<FieldInterface[]>
    getFieldByAlias: (alias: string) => FieldInterface


    reset: () => void
}

export class DataSet extends EventEmitter implements DataSetInterface  {
    constructor() {
        super()
    }

    private _props: DataSetParamsInterface = {
        alias: "",
        datasource: ""
    }
    private _items: any[] = []
    private _page: number = 0
    private _loading = false
    private _totalCount = 0
    private api = useApiClient()
    private _sort: string[] = []
    private _search: string
    private _fields: FieldInterface[] = []
    private _fieldsByAlias = new Map<string, FieldInterface>()

    get props() : DataSetParamsInterface { return this._props }
    set props(props: DataSetParamsInterface) {
        this._props = props
        this._items = []
    }

    get search() {
        return this._search
    }

    set search(val) {
        this._search = val
    }


    set sort(sort: string[]) {
        this._sort = sort
    }

    get isLoading() : boolean { return this._loading }

    get items() : any[] { return this._items }
    get totalCount() : number { return this._totalCount }
    get page() : number { return this._page }
    get allDataLoaded() : boolean { return this._items.length === this._totalCount }

    reset() {
        this.emit('reset-data')
        this.emit('insert', {
            items: this._items
        })
    }



    async getFields(): Promise<FieldInterface[]> {
        if (this._fields.length) {
            return this._fields
        }

        try {
            let res = (await this.api.get(`/v2/datasource/${this.props.datasource}/fields?nested=true`)).data
            this._fields = res.items

            this._fields.forEach(f => {
                this._fieldsByAlias.set(f.alias, f)
            })


            return res.items
        } catch (e) {
            console.log(e)
        }
    }

    getFieldByAlias(alias: string): FieldInterface {
        if (!this._fieldsByAlias.has(alias)) {
            console.warn(`Field by alias ${alias} doesn't exist. Did you get all fields?`)
        }
        return this._fieldsByAlias.get(alias)
    }



    async loadNext(reset = false) {
        if (this._loading || (!reset && this.allDataLoaded))
            return

        console.log('DataSet.loadNext, reset=', reset)

        if (reset) {
            this._page = 0
            this._totalCount = 0
            this.emit('reset-data')
        }

        let params: GetDataManyRequestDto = {
            limit: 50,
            offset: this.page * 50,
            sort: this._sort ? this._sort : [],
            query: this._search ? this._search : undefined
        }
        let res: GetDataManyResponseDto

        console.log('DataSet.loadNext.params',params)


        this._loading = true
        try {
            let dStart = new Date()
            res = (await this.api.post(`/v2/datasource/${this.props.datasource}/data`, params)).data as GetDataManyResponseDto
            if (reset) {
                this._items = res.items
                this._totalCount = res.count
            } else {
                this._items.push(...res.items)
            }
            let dEnd = new Date()

            this._page++

            this.emit('insert', {
                items: res.items
            })

            console.log(`Got ${res.items.length} rows for ${dEnd.valueOf() - dStart.valueOf()}ms`)
        } catch (e) {
            if (e.response.data.error) {
                throw new Error(e.response.data.error)
            } else {
                console.log(e)
                throw new Error("Oops... Something went wrong")
            }
        } finally {
            this._loading = false
        }
    }
}