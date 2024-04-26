import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";

export class Config implements ComponentInterface {
    name:string = 'CodeEditor'
    title:string = "Code editor"
    icon:string = "fluent:document-javascript-24-regular"
    group:string = 'Fields'
    properties:FieldConfigInterface[] = [{
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
    }, {
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        }
    ]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}