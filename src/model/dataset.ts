import {CustomDataSource, DataSourceInterface, EntityInterface} from "./datasource";
import {FieldConfigInterface, FieldInterface, generateEntityWithDefault} from "./field";
import _ from 'lodash'
import {useDataSourceService} from "../services/datasource.service";
import { FlakeId } from '../flake-id'
import {EventEmitter} from "events";
let flakeId = new FlakeId()

let dsService = useDataSourceService()

export interface DataSetConfigInterface {
    alias: string,
    dataSource: string,
    autoCommit: boolean,
    autoOpen: boolean
}

export function useDataSet(config: DataSetConfigInterface): DataSet {
    let ds = dsService.getDataSourceByAlias(config.dataSource);

    if (!ds)
        return undefined;

    return new DataSet(config, ds)
}

export class DataSet extends  EventEmitter {

    constructor(config: DataSetConfigInterface, dataSource: DataSourceInterface) {
        super()
        this.dataSource = dataSource;
        this.alias = config.alias;
        this.autoOpen = config.autoOpen;
        this.autoCommit = config.autoCommit;
        this.keyField = this.dataSource.keyField

        this.dataSource.on('update', this.dataSourceUpdateHandler)
    }

    readonly alias: string;
    readonly dataSource: DataSourceInterface;
    readonly keyField: string;
    autoCommit: boolean = true;
    autoOpen: boolean = true;
    private _data = Array<EntityInterface>([])
    private _isOpen = false
    private context: any = {}
    private dataSourceUpdateHandler = this.onDataSourceUpdate.bind(this)

    setContext(ctx: any) {
        this.context = ctx

        if (!this.context)
            this.context = {}

        if (this.dataSource instanceof CustomDataSource)
            this.dataSource.setContext(this.context)
    }

    get isOpen() {
        return this._isOpen;
    }

    async getChildren(id: string) {
        let row = this.getRowById(id)

        if (row === undefined)
            return [];

        let item = this._data[row]
        item.children = await this.dataSource.getChildren(id)
        return item.children
    }

    async onDataSourceUpdate(id: string | Array<any>, field: string, value: any) {
        console.log('onDataSourceUpdate', id, field, value)
        // if (!id || id instanceof Array) {
        //     await this.load()
        //     this.emit('update')
        //     return
        // }
        //
        // let row = this.getRowById(id)
        //
        // if (!row)
        //     return;
        //
        // let item = this.data[row]
        // if (!item) {
        //     console.warn(`Can't find row in dataset "${this.alias}" by id "${id}"`)
        //     return
        // }
        //
        //
        // if (field) {
        //     item[field] = value
        // } else {
        //     this.data[row] = await this.dataSource.getById(id)
        // }
        this.emit('update')
    }

    isChanged() : boolean {
        return true
    }

    get data(): Array<EntityInterface> {
        return this._data
    }

    set data(data: Array<EntityInterface>) {
        this._data = data;

        if (this.dataSource instanceof CustomDataSource) {
            this.dataSource.setData(data).then()
        }
    }

    async open() {
        this.close()
        try {
            await this.load()

            this._isOpen = true;
            this.emit('open')
        } catch (e) {
            throw e
        }
        console.log("dataset opened ", this.isOpen)
    }

    async openOne(id?: string) {
        this.close()

        let _id = id;

        let one = undefined
        try {
            if (id) {
                one = await this.dataSource.getById(id)
            } else {
                _id = (await flakeId.generateId()).toString()
                one = generateEntityWithDefault(this.dataSource.fields)
                one.id = _id
            }

        } catch (e) {
            console.log("Error while open data set ", this.alias, 'with id ', id)
            throw e
        }

        if (one) {
            this.data.push(one)
            this._currentId = _id;
            this._isOpen = true;

        }
        console.log("dataset opened one ", this.alias)

        this.emit('open')
    }

    close() {
        this.data = []
        this._isOpen = false;
        this._currentId = null;
        this.emit('close')
    }

    selectedIds: string[] = []
    private _currentId: string | null = null

    get currentId(): string | null {
        return this._currentId;
    }

    set currentId(val) {
        this._currentId = val
    }

    get current() : EntityInterface {
        if (this._isOpen) {
            let row = this.getRowById(this.currentId)
            return this.data[row]
        }
        return undefined;
    }

    async setCurrentId(id: string | null) {
        if (this.autoCommit &&
            this.isChanged() &&
            this._currentId !== null &&
            this._currentId !== id) {
        }
        this._currentId = id
    }

    async load() {
        this.data = _.cloneDeep(await this.dataSource.getAll());
    }


    getByRow(row: number) : EntityInterface {
        return this.data[row]
    }

    getColumnByAlias(alias: string): FieldInterface | undefined {
        return this.dataSource.getFieldByAlias(alias);
    }

    async getValue(id: string, field: string): Promise<any> {
        if (!field || !id) {
            return null
        }

        let item = undefined
        if (this.dataSource.isTree) {
            item = await this.dataSource.getById(id)
        } else {
            let row = this.getRowById(id)

            if (row === undefined) {
                //console.log(`Row by id ${id} not found`)
                //console.log(this._data)
                return null
            }
            item = this.data[row]
        }

        let f = this.dataSource.getFieldByAlias(field)
        let ctx = _.cloneDeep(this.context)
        ctx.row = item

        let getValueFunc = await f.getValueFunc()

        if (getValueFunc) {
            try {
                return await getValueFunc.exec(ctx)
            } catch (e) {
                console.error(`Error while evaluating field ${f.alias} function setValue of data set ${this.alias}`)
                console.error(e)
                return 'Error'
            }
        } else {
            try {
                return item[field]
            } catch (e) {
                console.error(e)
            }

        }

    }

    async insertRow(): Promise<string> {
        if (!this.isOpen) {
            throw new Error(`DataSet ${this.alias} is not open`)
        }

        let item = generateEntityWithDefault(this.dataSource.fields)
        item.id = (await flakeId.generateId()).toString()

        await this.dataSource.insert(item.id, item, this.dataSource.isTree ? this._currentId : undefined)

        return this.currentId
    }

    async update(field: string, data: any) {
        if (!this.isOpen  || !this._currentId) {
            throw new Error(`DataSet ${this.alias} is not open`)
        }

        //let row = this.getRowById(this._currentId)

        await this.setValue(this._currentId, field, data);
    }

    async setValue(id: string, field: string, cellData: any) {

        await this.dataSource.setValue(id, field, cellData)
        //this.emit('update')

        return true;
    }

    async remove(id: string) {
        if (!this.isOpen) {
            throw new Error(`DataSet ${this.alias} is not open`)
        }

        await this.dataSource.removeById(id)
    }

    async removeByCurrentId() {
        if (!this.isOpen) {
            throw new Error(`DataSet ${this.alias} is not open`)
        }
        if (!this._currentId)
            return false;

        await this.dataSource.removeById(this._currentId)
        return true
    }

    removeBySelectedId() : boolean {
        if (!this.isOpen) {
            throw new Error(`DataSet ${this.alias} is not open`)
        }

        if (!this.selectedIds.length)
            return false;

        this.selectedIds.forEach((id) => {
            this.remove(id)
        })
        return true
    }

    private getRowById(id: string): number | undefined {
        for (let i in this.data) {
            if (this.data[i].id === id) {
                return Number(i)
            }
        }
        return undefined
    }
}

export const dataSetProperties:FieldConfigInterface[] = [
    {
        title: 'Alias',
        alias: 'alias',
        type: "string",
        required: true
    },
    {
        title: 'DataSource',
        alias: 'dataSource',
        type: 'datasource',
        required: true
    },
    {
        title: 'Auto open',
        alias: 'autoOpen',
        type: 'bool',
        required: false,
        default: true
    },
    {
        title: 'Auto commit changes',
        alias: 'autoCommit',
        type: 'bool',
        required: false,
        default: true
    },
]