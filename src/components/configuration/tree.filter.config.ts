import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";

export class Config implements ComponentInterface {
    name: string = 'TreeFilter'
    title: string = "Tree filter"
    icon: string = "ic:outline-filter-alt"
    group: string = 'Filters'
    properties:FieldConfigInterface[] = [
        {
            title: "Tree field",
            alias: "field",
            type: "field"
        },{
            title: "Multiple",
            alias: "multiple",
            type: "bool"
        },
        {
            title: "Type",
            alias: "type",
            type: "enum",
            values: [
                {
                    key: "list",
                    title: "List"
                },{
                    key: "dropdown",
                    title: "Dropdown"
                }
            ]
        },
        {
            title: "Show root item",
            alias: "rootItem",
            type: "bool"
        },
        {
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        }]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}