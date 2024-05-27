import {ComponentInterface} from "../../model/page";
import {FieldConfigInterface} from "../../model/field";

export class Config implements ComponentInterface {
    name:string = 'FileField'
    title:string = "File"
    icon:string = "ph:file-duotone"
    group:string = "Fields"
    properties:FieldConfigInterface[] = [{
        title: "Field",
        alias: "field",
        type: "field"
    },{
        title: "Title",
        alias: "title",
        type: "string"
    },{
        title: "Drag",
        alias: "drag",
        type: "bool"
    },{
        title: 'Visibility',
        alias: 'visible',
        type: 'handler'
    }]
    defaultPosition = {
        rows: 1,
        cols: 2
    }
}