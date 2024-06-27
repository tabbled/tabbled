import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";

export class Config implements ComponentInterface {
    name: string = 'StatusFilter'
    title: string = "Status filter"
    icon: string = "ic:outline-filter-alt"
    group: string = 'Filters'
    properties:FieldConfigInterface[] = [
        {
            title: "Status field",
            alias: "field",
            type: "field"
        },{
            title: "Multiple",
            alias: "multiple",
            type: "bool"
        },
        {
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        },{
            title: "Values",
            alias: "values",
            type: "string"
        }]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}