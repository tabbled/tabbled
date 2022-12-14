import {DataSourceConfigInterface} from "./datasource";

export type FieldDataType =
    'number' |
    'string' |
    'bool' |
    'text' |
    'list' |
    'status' |
    'image' |
    'datetime' |
    'date' |
    'time' |
    'link' |
    'table'

export interface FieldConfigInterface {
    title: string,                      // Using in table and editor titles
    alias: string,                      // Using in calculations
    type: FieldDataType,
    required: boolean,
    link?: string,                      // Data source alias
    values?: string[] | number[],       // Only for types
    isMultiple?: boolean,
    decimals?: number,                  // Only for type numeric
    default?: string | number |
        object | object[] | null,
    datasource?: DataSourceConfigInterface  // Only for type Table, that can be passed a DataSourceConfig
    getValueScript?: string                    // Evaluate when entity changed, result of eval sets to field value
    onValueChangeScript?: string             // Evaluate when value changed manually by user or by another script
}

export interface FieldInterface {
    title: string,                      // Using in table and editor titles
    alias: string,                      // Using in calculations
    type: FieldDataType,
    required: boolean,
    link?: string,                      // Data source alias
    values?: string[] | number[],       // Only for types
    isMultiple?: boolean,
    decimals?: number,                  // Only for type numeric
    default?: string | number |
        object | object[] | null,
    datasource?: DataSourceConfigInterface  // Only for type Table, that can be passed a DataSourceConfig

    getValues(): Promise<object[]>,
    getFormattedValue(value: any) : Promise<any>
}

export class Field implements FieldInterface {
    constructor(config: FieldConfigInterface) {
        this.alias = config.alias;
        this.title = config.title
        this.type = config.type;
        this.datasource = undefined;
        this.decimals = config.decimals;
        this.isMultiple = config.isMultiple;
        this.link = config.link;
        this.required = config.required;

    }
    alias: string;
    type: FieldDataType;
    decimals?: number;
    default?: string | number | object | object[] | null;
    isMultiple?: boolean;
    link?: string;
    required: boolean;
    title: string;
    datasource?: DataSourceConfigInterface;

    async getFormattedValue(value: any): Promise<any> {
        return []
    }

    async getValues(): Promise<object[]> {
        return []
    }
}
