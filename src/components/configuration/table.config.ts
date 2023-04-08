import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [
    {
        title: "Data source",
        alias: "datasource",
        type: 'datasource'
    },{
        title: "Field",
        alias: "field",
        type: 'field'
    }
    ,{
        title: "Title",
        alias: "title",
        type: "string"
    },{
        title: "Readonly",
        alias: "readonly",
        type: 'bool',
        default: true
    },{
        title: 'Columns',
        alias: 'columns',
        type: 'list',
        listOf: 'column',
        keyProp: 'field',
        displayProp: 'title'
    },{
        title: "onRowDoubleClick",
        alias: "onRowDoubleClick",
        type: 'handler'
    },{
        title: "onRowClick",
        alias: "onRowClick",
        type: 'handler'
    }]
}