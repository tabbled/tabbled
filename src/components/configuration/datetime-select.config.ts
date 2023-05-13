import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";

export class Config implements ComponentInterface {
    name:string = 'DateTimeInput'
    title:string = "Datetime input"
    icon:string = "mdi:calendar"
    group:string = "Fields"
    properties:FieldConfigInterface[] = [{
            title: "Field",
            alias: "field",
            type: "field"
        },{
            title: "Title",
            alias: "title",
            type: "string"
        },
        {
            title: "Format",
            alias: "format",
            type: "string"
        }]
    defaultPosition = {
        rows: 1,
        cols: 6
    }
}