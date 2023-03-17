import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "DataSet",
        alias: "dataSet",
        type: 'dataset'
    },{
        title: "Field",
        alias: "field",
        type: 'field'
    },{
        title: "Title",
        alias: "title",
        type: 'string'
    },{
        title: "Row selectable",
        alias: "isRowSelectable",
        type: 'bool',
        default: true
    },{
        title: "Inline editing",
        alias: "isInlineEditing",
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