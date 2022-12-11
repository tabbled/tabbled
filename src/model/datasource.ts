import {Field, FieldConfigInterface, FieldInterface} from "./field";

/**
 * Basic data source interface
 */
export interface DataSourceInterface {
    /**
     * Editable data source, user can edit editable fields
     */
    isEditable: boolean,

    isTree?: boolean

    fields: FieldInterface[]

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
}

export interface DataSourceConfigInterface {
    fields: FieldConfigInterface[],
    title?: string,
    alias: string,
    isEditable?: boolean,
    keyField: string,
    isTree?: boolean
}

export class DataSource implements DataSourceInterface {
    constructor(config: DataSourceConfigInterface) {
        this.isEditable = !!config.isEditable
        this.keyField = config.keyField;
        this.isTree = config.isTree;
        this.fields = []

        config.fields.forEach(conf => {
            this.fields.push(new Field(conf))
        })

        console.log(this.fields)


    }

    fields: FieldInterface[];
    isEditable: boolean;
    keyField: string;
    isTree?: boolean;

    getAll(): object[] {
        if (this.onCellChange instanceof Function) {
            this.onCellChange(100, 'ssa', 'asdasd')
        }
        return [{
            name: "aaaa",
            color: "red"
        },{
            name: "bbbb",
            color: "black"
        },{
            name: "ccc",
            color: "blue"
        }];

    }

    getById(id: string | number): object | null {
        return null;
    }

    getByRow(row: number): object | null {
        return null;
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