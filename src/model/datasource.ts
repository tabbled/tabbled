import {Field, FieldConfigInterface, FieldInterface} from "./field";

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
    getAll(): EntityInterface[]

    /**
     * Return entity data by row
     * @param id entity id
     * @returns entity if exists or null if not exists
     */
    getById(id: string | number) : EntityInterface | undefined


    //onCellChange?: (row: number, newValue: any, oldValue?: any) => void;
    //onRowChange?: (newValue: any, oldValue?: any) => void;

    insert(value: any): Promise<any>
    updateById(id: number | string, value: object): Promise<any>
    removeById(id: number | string): Promise<any>

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
        id: 1,
        name: "aaaa",
        color: "red"
    },{
        id: 2,
        name: "bbbb",
        color: "black"
    },{
        id: 3,
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

    getAll(): EntityInterface[] {
        return this.data;
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    getById(id: string | number): EntityInterface | undefined {
        return undefined;
    }

    async removeById(id: number | string): Promise<any> {
        return false;
    }

    insert(value: any): Promise<any> {
        return Promise.resolve(undefined);
    }

    updateById(id: number | string, value: object): Promise<any> {
        return Promise.resolve(undefined);
    }
}

export class ConfigDataSource implements DataSourceInterface {
    constructor(alias: string, keyField: string, fields: FieldConfigInterface[]) {
        this.fieldByAlias = new Map()
        this.alias = alias
        this.keyField = keyField

        fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        this.fields = [...this.fieldByAlias.values()]
    }

    private fieldByAlias: Map<string, FieldInterface>
    private data: Object[] = []

    alias: string;
    fields: FieldInterface[];
    keyField: string;
    storageType = StorageType.config;
    cached = true;
    readonly = false

    setData(data: EntityInterface[]) {
        this.data = data;
    }

    getAll(): EntityInterface[] {
        return this.data
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    getById(id: string | number): EntityInterface | undefined {
        return undefined;
    }

    async removeById(id: number | string): Promise<any> {
        return false;
    }

    insert(value: any): Promise<any> {
        return Promise.resolve(undefined);
    }

    updateById(id: number | string, value: object): Promise<any> {
        return Promise.resolve(undefined);
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
}