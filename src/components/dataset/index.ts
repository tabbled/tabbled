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
    id: string
    field: string
    operation: StandardQueryOperator
    compare?: any
}

export class GetDataManyRequestDto {
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
    fieldsToSelect: string[]

    loadNext: (reset: boolean) => Promise<void>

    getFields: () => Promise<FieldInterface[]>
    getFieldByAlias: (alias: string) => FieldInterface

    // Update filter and stringifies to filterBy
    setFilter: (filter: FilterItemInterface[]) => void
    restoreFilter: (parsedFilter: string) => void
    backupFilter: () => string

    // After updating filter by setFilter it invokes
    onFilterUpdate?: () => void


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
    private _filterById = new Map<string, FilterItemInterface>()
    private _filterBy = ""
    private _fieldsToSelect: string[] = []

    onFilterUpdate?: () => void

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

    set fieldsToSelect(fields: string[]) {
        this._fieldsToSelect = fields
    }
    get fieldsToSelect() {
        return this._fieldsToSelect
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
            query: this._search ? this._search : undefined,
            filterBy: this._filterBy ? this._filterBy : undefined,
            fields: this._fieldsToSelect.length ? this._fieldsToSelect : undefined
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

    setFilter(filter: FilterItemInterface[]) : void {
        console.log('setFilter', filter)
        filter.forEach(f => {
            this._filterById.set(f.id, f)
        })

        this.stringifyFilter()

        this.emit('filter-updated')

        if (this.onFilterUpdate instanceof Function) {
            this.onFilterUpdate()
        }
    }

    restoreFilter(filterBy: string) {
        this._filterBy = filterBy
    }
    backupFilter() : string {
        return this._filterBy
    }

    stringifyFilter() {
        let filterBy = ""
        for (let [key, item] of this._filterById) {
            let field = this._fieldsByAlias.get(item.field)
            if (!field)
                continue

            let filter = ""
            switch (item.operation) {
                case "between":
                case "!between":
                    if (item.compare && item.compare.length === 2) {
                        filter = `(${item.field} >= ${item.compare[0]} AND ${item.field} <= ${item.compare[1]})`
                    }
                    break
                case "!in":
                case "in":
                    console.log(item.compare)
                    if (item.compare && item.compare.length > 0) {
                        filter = `(${item.field} ${item.operation === '!in' ? 'NOT' : ''} IN [${item.compare}])`
                    }
            }

            if (filter) {
                if (filterBy !== "")
                    filterBy += " AND "
                filterBy += filter
            }
        }


        this._filterBy = filterBy
        console.log(this._filterBy)

    }
}