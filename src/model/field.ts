import {EntityInterface} from "./datasource";
import {CompiledFunc, compileScript} from "../services/compiler";
import { FlakeId } from '../flake-id'
let flakeId = new FlakeId()


export type FieldComponentType = 'handler' | 'dataset' | 'datasource' | 'elements' | 'field' | 'role'
export type FieldDataType = 'number' | 'string' | 'code' | 'password' | 'bool' | 'text' | 'list' | 'enum' | 'status' | 'image' | 'file' |'datetime' | 'date' | 'time' | 'link' | 'table'
export type FieldType = FieldComponentType | FieldDataType
export type FieldListOfType = 'dataset' | 'element' | 'column' | 'field' | 'action' | 'rule'

export type NumericFormatType = 'none' | 'decimal' | 'currency'
export type FormatType = NumericFormatType

export function getFieldDataTypes():Array<FieldDataType> {
    return [
        'number',
        'string',
        'bool',
        'text',
        'password',
        //'list',
        'enum',
       // 'status',
        'image',
        'file',
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
    required?: boolean | Function,
    hidden?:boolean,
    listOf?: FieldListOfType
    keyProp?: string,
    displayProp?: string,
    link?: string,                      // Data source alias
    values?: EnumValuesInterface[] | (() => Promise<EnumValuesInterface[]>),       // Only for types
    isMultiple?: boolean,
    isTree?:boolean,
    precision?: number,                  // Only for type numeric
    default?: any,
    datasource?: string  // Only for type Table, that can be passed a DataSourceConfig
    getValue?: string                    // Evaluate when entity changed, result of eval sets to field value
    getListValues?: string             // Evaluate when list or enum field gets values for dropdown menu
    setValue?: string             // Evaluate when value changed manually by user or by another script
    getReadonly?: string
    dataSetField?: string, // For 'field' type that used for looking fields list in set dataset on PageSettingPanel
    format?: FormatType,
    autoincrement?: boolean,
    searchable?: boolean // Only for string and number types
    searchDialog?: string // only for link field
}

export interface FieldInterface {
    title: string,                      // Using in table and editor titles
    alias: string,                      // Using in calculations
    type: FieldType,
    required?: boolean | Function,
    hidden?: boolean,
    listOf?: FieldListOfType
    keyProp?: string,
    displayProp?: string,
    link?: string,                      // Data source alias
    values?: EnumValuesInterface[] | (() => Promise<EnumValuesInterface[]>),       // Only for types
    isMultiple?: boolean,
    isTree?:boolean,
    precision?: number,                  // Only for type numeric
    default?: string | number |
        object | object[] | null | boolean,
    datasource?: string  // Only for type Table, that can be passed a DataSourceConfig
    config?: FieldConfigInterface

    getValueFunc?: () => CompiledFunc | undefined,
    setValueFunc?: () => CompiledFunc | undefined,
    getListFunc?: () => CompiledFunc | undefined
    getReadonlyFunc?: () => CompiledFunc | undefined
    enumValues?: EnumValuesInterface[]
}

export class Field implements FieldInterface {
    constructor(config: FieldConfigInterface | FieldInterface) {
        this.alias = config.alias;
        this.title = config.title
        this.type = config.type;
        this.datasource = config.datasource;
        this.precision = config.precision;
        this.isMultiple = config.isMultiple;
        this.link = config.link;
        this.required = config.required;
        this.values = config.values
        this.default = config.default
        this.isTree = config.isTree
        this.config = config

        if (this.config.setValue && !this._setValueFunc) {
            try {
                this._setValueFunc = compileScript(this.config.setValue, 'ctx')
            } catch (e) {
                this._setValueFunc = null
                console.error(`Error while compiling field ${this.alias} function setValue`)
                console.error(e)
            }
        }

    }

    readonly _getValueFunc: CompiledFunc = null
    readonly _setValueFunc: CompiledFunc = null
    readonly _getReadonlyFunc: CompiledFunc = null


    alias: string;
    type: FieldType;
    precision?: number;
    default?: string | number | object | object[] | null;
    isMultiple?: boolean;
    isTree?:boolean;
    link?: string;
    required: boolean | Function;
    title: string;
    datasource?: string;
    values: EnumValuesInterface[] | (() => Promise<EnumValuesInterface[]>)
    config: FieldConfigInterface
    enumValues: []

    getValueFunc(): CompiledFunc | undefined {

        if (this.config.getValue) {
            try {
                return compileScript(this.config.getValue, 'ctx')
            } catch (e) {
                console.error(`Error while compile field ${this.alias} function getValue`)
                console.error(e)
            }
        }
        return undefined
    }

    setValueFunc(): CompiledFunc | undefined {


        return this._setValueFunc
    }
    getListFunc() : CompiledFunc | undefined {
        if (this.config.getListValues) {
            try {
                return compileScript(this.config.getListValues, 'ctx')
            } catch (e) {
                console.error(`Error while compile field ${this.alias} function getListValues`)
                console.error(e)
            }
        }
        return undefined
    }
    getReadonlyFunc() : CompiledFunc | undefined {

        if (this.config.getReadonly) {
            try {
                return compileScript(this.config.getReadonly, 'ctx')
            } catch (e) {
                console.error(`Error while compile field ${this.alias} function getReadonly`)
                console.error(e)
            }
        }
        return undefined
    }
}

export async function generateEntityWithDefault(fields: FieldConfigInterface[] | FieldInterface[]): Promise<EntityInterface> {
    let item = {
        id: flakeId.generateId().toString()
    }
    for (let i in fields) {
        const f = fields[i]

        switch (f.type) {
            case "bool": item[f.alias] = f.default ? f.default : false; break;
            case "number": item[f.alias] = f.default ? Number(f.default) : null; break;
            case "string":
            case "enum":
            case "text": item[f.alias] = f.default ? f.default : ""; break;
            case "list":
            case "elements":
            case "table": item[f.alias] = []; break;
            case "handler": item[f.alias] = f.isMultiple ? [] : {type: 'script', script: ""};break;
            default: item[f.alias] = null;
        }
    }
    return item;
}