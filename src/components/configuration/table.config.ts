
import {ComponentInterface} from "../../model/page";
import {FieldConfigInterface} from "../../model/field";

export class Config implements ComponentInterface {
    name:string = 'Table'
    title:string = "Table"
    icon:string = "mdi:table"
    group:string = 'Fields'
    properties:FieldConfigInterface[] = [
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
            title: "Action buttons are visible",
            alias: "actionButtonsVisible",
            type: 'bool',
            default: true
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
        },{
            title: "onAdd",
            alias: "onAdd",
            type: 'handler'
        },{
            title: "onEdit",
            alias: "onEdit",
            type: 'handler'
        },{
            title: "onRemove",
            alias: "onRemove",
            type: 'handler'
        }]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}