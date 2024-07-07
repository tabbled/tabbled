import {ComponentInterface} from "../../model/page";
import {FieldConfigInterface} from "../../model/field";

export class Config implements ComponentInterface {
    name = 'TableV2'
    title = "Table v2"
    icon = "mdi:table"
    group  = 'Fields'
    filterable = true
    properties: FieldConfigInterface[] = [
        {
            title: "Data source",
            alias: "datasource",
            type: 'datasource'
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
            title: "Height",
            alias: "height",
            type: 'number',
            default: null
        },
        {
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
        },
        {
            title: "Actions",
            alias: "Actions",
            type: 'list',
            listOf: 'action',
            keyProp: 'alias',
            displayProp: 'alias',
        }]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}