import {FieldConfigInterface, FieldInterface} from "./field";

export interface ColumnConfigInterface {
    field: string,
    width: number,
    title?: string,
    sortable?: boolean
}

export interface ColumnInterface {
    field: FieldInterface
    width: number,
    title: string,
    sortable?: boolean,
}

export class Column implements ColumnInterface {
    constructor(config: ColumnConfigInterface,field: FieldInterface) {
        this.field = field;
        this.sortable = config.sortable;
        this.width = config.width || 200;
        this.title = config.title || field.title;
    }

    field: FieldInterface;
    sortable?: boolean;
    title: string;
    width: number;

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
    }]