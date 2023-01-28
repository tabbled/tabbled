import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "DataSet",
        alias: "dataSet",
        type: 'dataset'
    },{
        title: "Allow add",
        alias: "allowAdd",
        type: 'bool',
        default: true
    },{
        title: "Allow edit",
        alias: "allowEdit",
        type: 'bool',
        default: true
    },{
        title: "Allow remove",
        alias: "allowRemove",
        type: 'bool',
        default: true
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
}