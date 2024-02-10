import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";


export class Config implements ComponentInterface {
    name:string = 'CheckboxField'
    title:string = "Checkbox"
    icon:string = "mdi:checkbox-outline"
    group:string = 'Fields'
    properties:FieldConfigInterface[] = [
        {
            title: "Field",
            alias: "field",
            type: 'field'
        },{
            title: "Title",
            alias: "title",
            type: "string"
        },{
            title: "Readonly",
            alias: "readonly",
            type: 'bool',
            default: false
        },
        {
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        }]
    defaultPosition = {
        rows: 1,
        cols: 2
    }
}