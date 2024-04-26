import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";

export class Config implements ComponentInterface {
    name:string = 'LinkSelect'
    title:string = "Link select"
    icon:string = "mdi:form-dropdown"
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
            title: "Disabled",
            alias: "disabled",
            type: "bool"
        },{
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        }]
    defaultPosition = {
        rows: 1,
        cols: 4
    }
}
