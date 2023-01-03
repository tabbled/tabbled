import {Field, FieldConfigInterface, FieldInterface} from "./field";
import _ from 'lodash'
import { useConfigDatabase } from '../services/database.service'

const configDatabase = useConfigDatabase()

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

        return await configDatabase[this.alias].toArray();
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getById(id: string): Promise<EntityInterface | undefined> {
        return await configDatabase[this.alias].get(id)
    }

    async removeById(id: string): Promise<void> {
        let data = await this.getById(id);
        if (!data)
            return;
        await configDatabase[this.alias].delete(id)
    }

    async insert(id: string, value: any): Promise<void> {
        try {
            let data = _.cloneDeep(value)
            await configDatabase[this.alias].add(data);
        } catch (e) {
            throw e
        }
    }

    async updateById(id: string, value: object): Promise<void> {
        try {
            let data = _.cloneDeep(value)
            await configDatabase[this.alias].put(data);
        } catch (e) {
            throw e
        }
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