import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "DataSet",
        alias: "dataSet",
        type: 'dataset'
    },{
        title: "Field",
        alias: "field",
        type: "field"
    },{
        title: "Title",
        alias: "title",
        type: "string"
    },{
        title: "Format",
        alias: "format",
        type: "enum",
        values: [{ key: 'json', title: 'Json' }, { key: 'javascript', title: "JavaScript" }]
    },{
        title: "Runnable",
        alias: "runnable",
        type: "bool"
    }
    ]
}