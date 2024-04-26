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
        },
        {
            title: "Type",
            alias: "type",
            type: "enum",
            values: [
                {
                    key: 'datetime',
                    title: "Datetime"
                },
                {
                    key: 'date',
                    title: "Date"
                },{
                    key: 'month',
                    title: "Month"
                },{
                    key: 'year',
                    title: "Year"
                },{
                    key: 'week',
                    title: "Week"
                },
            ]
        },
        {
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        }
    ]
    defaultPosition = {
        rows: 1,
        cols: 4
    }
}