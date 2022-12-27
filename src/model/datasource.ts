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

/**
 * Basic data source interface
 */
export interface DataSourceInterface {
    /**
     * Editable data source, user can edit editable fields
     */
    isEditable: boolean,

    alias: string,

    isTree?: boolean

    fields: FieldInterface[],

    storageType: StorageType,

    cached: boolean

    /**
     * alias of field that is a primary key of data source
     */
    keyField: string,

    /**
     * Get all data store from the data source
     * @returns {object[]} all data from data source
     */
    getAll(): object[]

    /**
     * Return entity data by row
     * @param row row number of dataset
     * @returns entity if exists or null if not exists
     */
    getByRow(row: number) : object | null

    /**
     * Return entity data by row
     * @param id entity id
     * @returns entity if exists or null if not exists
     */
    getById(id: string | number) : object | null

    /**
     * Set data in certain field by row number
     * @param row number
     * @param field alias
     * @param value that should be set to the entity
     * @returns {object[]} the all data from data source
     */
    setValueByRow(row: number, field: string, value: any): boolean

    /**
     * Set data in certain field by row number
     * @param id unique indetifier of entity
     * @param field alias of field
     * @param value that should be set to the entity
     * @returns {boolean} success of setting value
     */
    setValueById(id: number | string, field: string, value: any): boolean

    /**
     * Invokes when some value in data has been changed
     * @param alias field that has been changed
     * @param oldValue old value of entity
     * @param newValue new value of entity
     */
    onCellChange?: (row: number, newValue: any, oldValue?: any) => void;
    //onRowChange?: (newValue: any, oldValue?: any) => void;

    removeByRow(row: number): Promise<any>
    removeById(id: number | string): Promise<any>

    getFieldByAlias(alias: string): FieldInterface | undefined
}

export interface DataSourceConfigInterface {
    fields: FieldConfigInterface[],
    type: DataSourceType,
    title?: string,
    alias: string,
    isEditable?: boolean,
    keyField: string,
    isTree?: boolean,
    storageType: StorageType,
}

export class DataSource implements DataSourceInterface {
    constructor(config: DataSourceConfigInterface) {
        this.isEditable = !!config.isEditable
        this.keyField = config.keyField;
        this.isTree = config.isTree;
        this.storageType = config.storageType;
        this.fieldByAlias = new Map()
        this.alias = config.alias

        config.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        this.fields = [...this.fieldByAlias.values()]
    }

    private data: object[] = [{
        name: "aaaa",
        color: "red"
    },{
        name: "bbbb",
        color: "black"
    },{
        name: "ccc",
        color: "blue"
    }]

    private fieldByAlias: Map<string, FieldInterface>

    alias: string;
    fields: FieldInterface[];
    isEditable: boolean;
    keyField: string;
    isTree?: boolean;
    storageType: StorageType;
    cached: boolean = true;

    getAll(): object[] {
        if (this.onCellChange instanceof Function) {
            this.onCellChange(100, 'ssa', 'asdasd')
        }
        return this.data;

    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    getById(id: string | number): object | null {
        return null;
    }

    getByRow(row: number): object | null {
        return this.data[row];
    }

    setValueById(id: number | string, field: string, value: any): boolean {
        return false;
    }

    setValueByRow(row: number, field: string, value: any): boolean {
        return false;
    }

    onCellChange?: (row: number, newValue: any, oldValue?: any) => void;

    async removeById(id: number | string): Promise<any> {
        return false;
    }

    async removeByRow(row: number): Promise<any> {
        return false;
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
    isEditable = true;
    keyField: string;
    storageType = StorageType.config;
    cached = true;

    setData(data: Object[]) {
        this.data = data;
    }

    getAll(): object[] {
        console.log('getAll')
        return this.data
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    getById(id: string | number): object | null {
        return null;
    }

    getByRow(row: number): object | null {
        return []
    }

    setValueById(id: number | string, field: string, value: any): boolean {
        return false;
    }

    setValueByRow(row: number, field: string, value: any): boolean {
        return false;
    }

    onCellChange?: (row: number, newValue: any, oldValue?: any) => void;

    async removeById(id: number | string): Promise<any> {
        return false;
    }

    async removeByRow(row: number): Promise<any> {
        return false;
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