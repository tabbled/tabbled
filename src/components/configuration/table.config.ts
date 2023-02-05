import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "DataSet",
        alias: "dataSet",
        type: 'dataset'
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