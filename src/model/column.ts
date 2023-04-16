import {FieldConfigInterface} from "./field";

export interface ColumnConfigInterface {
    id: string,
    field: string,
    width: number,
    title?: string,
    sortable?: boolean,
    visible?: boolean,
    readonly: boolean
}

export const columnProperties:FieldConfigInterface[] = [
    {
        title: 'Field',
        alias: 'field',
        type: "string",
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
    }]