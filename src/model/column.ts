import {FieldInterface} from "./field";

export interface ColumnConfigInterface {
    fieldAlias: string,
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