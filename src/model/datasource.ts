import {Field, FieldConfigInterface, FieldInterface} from "./field";
import _ from 'lodash'
import {useDatabase} from '../services/database.service'

const configDatabase = useDatabase()

export enum StorageType {
    internal = 'internal',
    external = 'external',
    config = 'config'
}

export enum DataSourceType {
    tableField = 'tableField',
    entity = 'entity'
}

export interface EntityInterface {
    [name: string]: any | never
}

export interface DataSourceInterface {
    readonly: boolean,
    alias: string,
    isTree?: boolean
    fields: FieldInterface[],
    storageType: StorageType,
    cached: boolean
    keyField: string,

    /**
     * Get all data store from the data source
     * @returns {object[]} all data from data source
     */
    getAll(): Promise<EntityInterface[]>

    /**
     * Return entity data by row
     * @param id entity id
     * @returns entity if exists or null if not exists
     */
    getById(id: string | number) : Promise<EntityInterface | undefined>


    //onCellChange?: (row: number, newValue: any, oldValue?: any) => void;
    //onRowChange?: (newValue: any, oldValue?: any) => void;

    insert(id: string, value: any): Promise<void>
    updateById(id: string, value: object): Promise<void>
    removeById(id: string): Promise<void>

    getFieldByAlias(alias: string): FieldInterface | undefined
}

export interface DataSourceConfigInterface {
    fields: FieldConfigInterface[],
    type: DataSourceType,
    title?: string,
    alias: string,
    readonly?: boolean,
    keyField: string,
    isTree?: boolean,
    storageType: StorageType,
}

export class DataSource implements DataSourceInterface {
    constructor(config: DataSourceConfigInterface) {
        this.keyField = config.keyField;
        this.isTree = !!config.isTree;
        this.storageType = config.storageType;
        this.fieldByAlias = new Map()
        this.alias = config.alias;
        this.readonly = !!config.readonly;

        config.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        this.fields = [...this.fieldByAlias.values()]
    }

    private data: EntityInterface[] = [{
        _id: "1",
        name: "aaaa",
        color: "red"
    },{
        _id: "2",
        name: "bbbb",
        color: "black"
    },{
        _id: "3",
        name: "ccc",
        color: "blue"
    }]

    private fieldByAlias: Map<string, FieldInterface>

    alias: string;
    fields: FieldInterface[];
    keyField: string;
    isTree?: boolean;
    storageType: StorageType;
    cached: boolean = true;
    readonly: boolean = false;

    async getAll(): Promise<EntityInterface[]> {
        return this.data;
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getById(id: string | number): Promise<EntityInterface | undefined> {
        return undefined;
    }

    async removeById(id: string): Promise<void> {

    }

    async insert(id: string, value: any): Promise<void> {

    }

    async updateById(id: number | string, value: object): Promise<void> {

    }
}

export class ConfigDataSource implements DataSourceInterface {
    constructor(alias: string, keyField: string, fields: FieldConfigInterface[]) {
        this.fieldByAlias = new Map()
        this.alias = alias
        this.keyField = keyField
        //this.store = store

        fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        this.fields = [...this.fieldByAlias.values()]
    }

    private fieldByAlias: Map<string, FieldInterface>
    //private store: Store<any>

    alias: string;
    fields: FieldInterface[];
    keyField: string;
    storageType = StorageType.config;
    cached = true;
    readonly = false

    async getAll(): Promise<EntityInterface[]> {

        return configDatabase.connection.select({
            from: this.alias,
            where: {
                _is_deleted: {
                    '!=': 1
                }
            }
        })
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getById(id: string): Promise<EntityInterface | undefined> {
        try {
            let data = await configDatabase.connection.select({
                from: this.alias,
                where: {
                    _id: id
                }
            })

            if (data && data.length > 0) {
                return Object.assign({}, data[0])
            }
            return undefined
        } catch (e) {
            console.error(e)
            throw e
        }

    }

    async insert(id: string, value: any): Promise<void> {
        try {
            let data = _.cloneDeep(value)
            data._created_at = new Date();
            data._updated_at = new Date();
            data._deleted_at = null;
            data._is_deleted = 0;
            data._version = 1;
            await configDatabase.connection.insert({
                into: this.alias,
                values:[data]
            })
        } catch (e) {
            throw e
        }
    }

    async updateById(id: string, value: object): Promise<void> {
        try {
            let old = await this.getById(id);

            if (!old) {
                console.error(`Item with id ${id} in "${this.alias}" config not found`)
                return;
            }

            let data:any = _.cloneDeep(value)

            data._updated_at = new Date();
            data._version = old._version + 1;
            let updated = await configDatabase.connection.update({
                in: this.alias,
                set: data,
                where: {
                    _id: id
                }
            })
            console.log('updated ' + updated + ' rows')
        } catch (e) {
            console.error(e)
        }
    }

    async removeById(id: string): Promise<void> {
        let data = await this.getById(id);
        if (!data)
            return;
        let updated = await configDatabase.connection.update({
            in: this.alias,
            set: {
                _deleted_at: new Date(),
                _is_deleted: 1
            },
            where: {
                _id: id
            }
        })
        console.log('updated ' + updated + ' rows')
    }
}

export class PageConfigDataSource extends ConfigDataSource {

    constructor() {
        super('pages', 'alias', [
            {
                title: 'Title',
                alias: 'title',
                type: "string",
                required: true
            },
            {
                title: 'Path',
                alias: 'path',
                type: "string",
                required: true
            },
            {
                title: 'Component',
                alias: 'component',
                type: "string",
                required: true
            },
            {
                title: 'Alias',
                alias: 'alias',
                type: "string",
                required: true
            },
            {
                title: 'Layout',
                alias: 'layout',
                type: "text",
                required: true
            }
        ]);
    }

    //store: Store<any>
}