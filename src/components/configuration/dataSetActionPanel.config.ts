import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "DataSet",
        alias: "dataSet",
        type: 'dataset'
    },{
        title: "Allow add",
        alias: "allowAdd",
        type: 'bool'
    },{
        title: "Allow edit",
        alias: "allowEdit",
        type: 'bool'
    },{
        title: "Allow remove",
        alias: "allowRemove",
        type: 'bool'
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