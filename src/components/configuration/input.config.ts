import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";

export class Config implements ComponentInterface {
    name: string = 'Input'
    title: string = "Input"
    icon: string = "mdi:form-textbox"
    group: string = 'Fields'
    properties:FieldConfigInterface[] = [{
        title: "Field",
        alias: "field",
        type: "field"
    },{
        title: "Title",
        alias: "title",
        type: "string"
    },{
        title: "Disabled",
        alias: "disabled",
        type: "bool"
    },{
        title: "Readonly",
        alias: "readonly",
        type: "bool"
    },{
        title: "Autosize",
        alias: "autosize",
        type: "bool"
    }]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}
export function properties():FieldConfigInterface[] {
    return
}