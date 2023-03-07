import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "DataSet",
        alias: "dataSet",
        type: 'dataset'
    },{
        title: "Field",
        alias: "field",
        type: "string"
    },{
        title: "Format",
        alias: "format",
        type: "enum",
        values: ['json', 'javascript']
    },{
        title: "Runnable",
        alias: "runnable",
        type: "bool"
    }
    ]
}