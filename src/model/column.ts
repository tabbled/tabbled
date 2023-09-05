import {FieldConfigInterface} from "./field";

export interface ColumnConfigInterface {
    id: string,
    field: string,
    width: number,
    title?: string,
    sortable?: boolean,
    visible?: boolean,
    readonly?: boolean,
    wordwrap?: boolean,
    total?: string
}

export const columnProperties:FieldConfigInterface[] = [
    {
        title: 'Field',
        alias: 'field',
        type: "field",
        required: true
    },
    {
        title: 'Title',
        alias: 'title',
        type: "string",
        required: true
    },
    {
        title: 'Width',
        alias: 'width',
        type: "number",
        required: true,
        default: 150
    },
    {
        title: 'Sortable',
        alias: 'sortable',
        type: "bool",
        default: true
    },
    {
        title: 'Visible',
        alias: 'visible',
        type: "bool",
        default: true
    },
    {
        title: 'Readonly',
        alias: 'readonly',
        type: "bool",
        default: false
    },
    {
        title: 'Word wrap',
        alias: 'wordwrap',
        type: "bool",
        default: false
    },
    {
        title: 'Total',
        alias: 'total',
        type: "enum",
        default: 'none',
        values: [{
            key: 'none',
            title: 'None'
        },{
            key: 'sum',
            title: 'Sum'
        },{
            key: 'min',
            title: 'Min'
        },{
            key: 'max',
            title: 'Max'
        },{
            key: 'count',
            title: 'Count'
        },{
            key: 'avg',
            title: 'Avg'
        },{
            key: 'first',
            title: 'First'
        },{
            key: 'last',
            title: 'Last'
        }]
    }]