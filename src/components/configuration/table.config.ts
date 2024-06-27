
import {ComponentInterface} from "../../model/page";
import {FieldConfigInterface} from "../../model/field";

export class Config implements ComponentInterface {
    name:string = 'Table'
    title:string = "Table"
    icon:string = "mdi:table"
    group:string = 'Fields'
    filterable: boolean = true
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
            title: "Height",
            alias: "height",
            type: 'number',
            default: null
        },{
            title: "Fill available height",
            alias: "fillHeight",
            type: 'bool',
            default: false
        },{
            title: "Show count",
            alias: "showCount",
            type: 'bool',
            default: false
        },{
            title: "Action buttons are visible",
            alias: "actionButtonsVisible",
            type: 'bool',
            default: true
        },{
            title: "Filters are visible",
            alias: "filtersVisible",
            type: 'bool',
            default: true
        },{
            title: "Search are visible",
            alias: "searchVisible",
            type: 'bool',
            default: true
        },
        {
            title: "Select all",
            alias: "canSelectAll",
            type: 'bool',
            default: false
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
        },
        {
            title: "Custom actions",
            alias: "customActions",
            type: 'list',
            listOf: 'action',
            keyProp: 'alias',
            displayProp: 'alias',
        },
        {
            title: "Filter data",
            alias: "preFilter",
            type: "handler"
        },
        {
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        },
        {
            title: 'Row highlight rules',
            alias: 'rowHighlightRules',
            type: 'list',
            listOf: 'rule',
            keyProp: 'title',
            displayProp: 'title',
        }]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}