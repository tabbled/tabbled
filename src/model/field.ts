import {DataSourceConfigInterface, EntityInterface} from "./datasource";


export type FieldComponentType = 'handler' | 'dataset' | 'datasource' | 'elements' | 'field'
export type FieldDataType = 'number' | 'string' | 'bool' | 'text' | 'list' | 'enum' | 'status' | 'image' | 'datetime' | 'date' | 'time' | 'link' | 'table'
export type FieldType = FieldComponentType | FieldDataType
export type FieldListOfType = 'dataset' | 'element' | 'column' | 'field' | 'action'

export function getFieldDataTypes():Array<FieldDataType> {
    return [
        'number',
        'string',
        'bool',
        'text',
        'list',
        'enum',
       // 'status',
        'image',
        'datetime',
        'date',
        'time',
        'link',
        'table'
    ]
}

export interface EventHandlerConfigInterface {
    type: 'script' | 'action'
    script?: string,
    action?: string
}

export interface EnumValuesInterface {
    key: string | number,
    title: string
}

export interface FieldConfigInterface {
    title: string,                      // Using in table and editor titles
    alias: string,                      // Using in calculations
    type: FieldType,
    tooltip?: string,
    required?: boolean,
    hidden?:boolean,
    listOf?: FieldListOfType
    keyProp?: string,
    displayProp?: string,
    link?: string,                      // Data source alias
    values?: EnumValuesInterface[],       // Only for types
    isMultiple?: boolean,
    precision?: number,                  // Only for type numeric
    default?: any,
    datasource?: DataSourceConfigInterface  // Only for type Table, that can be passed a DataSourceConfig
    getValueScript?: string                    // Evaluate when entity changed, result of eval sets to field value
    onValueChangeScript?: string             // Evaluate when value changed manually by user or by another script
}

export interface FieldInterface {
    title: string,                      // Using in table and editor titles
    alias: string,                      // Using in calculations
    type: FieldType,
    required?: boolean,
    hidden?: boolean,
    listOf?: FieldListOfType
    keyProp?: string,
    displayProp?: string,
    link?: string,                      // Data source alias
    values?: EnumValuesInterface[],       // Only for types
    isMultiple?: boolean,
    precision?: number,                  // Only for type numeric
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
        this.precision = config.precision;
        this.isMultiple = config.isMultiple;
        this.link = config.link;
        this.required = config.required;
        this.values = config.values
        this.default = config.default

    }
    alias: string;
    type: FieldType;
    precision?: number;
    default?: string | number | object | object[] | null;
    isMultiple?: boolean;
    link?: string;
    required: boolean;
    title: string;
    datasource?: DataSourceConfigInterface;
    values: EnumValuesInterface[]

    async getFormattedValue(value: any): Promise<any> {
        return []
    }

    async getValues(): Promise<object[]> {
        return []
    }
}

export function generateEntityWithDefault(fields: FieldConfigInterface[]):EntityInterface {
    let item = {}
    for (let i in fields) {
        const f = fields[i]

        switch (f.type) {
            case "bool": item[f.alias] = f.default ? f.default : false; break;
            case "string":
            case "enum":
            case "text": item[f.alias] = f.default ? f.default : ""; break;
            case "list":
            case "elements":
            case "table": item[f.alias] = []; break;
            case "handler": item[f.alias] = {type: 'script', script: ""};break;
            default: item[f.alias] = null;
        }
    }
    return item;
}