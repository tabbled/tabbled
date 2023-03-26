import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "DataSet",
        alias: "dataSet",
        type: 'dataset'
    },{
        title: "Field dataSet",
        alias: "fieldDataSet",
        type: 'dataset'
    },{
        title: "Field",
        alias: "field",
        type: 'field',
        dataSetField: "fieldDataSet"
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