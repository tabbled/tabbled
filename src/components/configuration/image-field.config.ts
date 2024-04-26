import {ComponentInterface} from "../../model/page";
import {FieldConfigInterface} from "../../model/field";

export class Config implements ComponentInterface {
    name:string = 'ImageField'
    title:string = "Image"
    icon:string = "mdi:file-image-box"
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
            title: "Image width",
            alias: "width",
            type: "number",
            default: 120
        },{
            title: "Image height",
            alias: "height",
            type: "number",
            default: 120
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