import {FieldConfigInterface} from "../../model/field";

export function properties():FieldConfigInterface[] {
    return [{
        title: "Field",
        alias: "field",
        type: "field"
    },{
        title: "Title",
        alias: "title",
        type: "string"
    },{
        title: "Image width",
        alias: "width",
        type: "number",
        default: 120
    },{
        title: "Image height",
        alias: "height",
        type: "number",
        default: 120
    }
    ]
}