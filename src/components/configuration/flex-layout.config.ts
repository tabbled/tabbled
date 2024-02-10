import {FieldConfigInterface} from "../../model/field";
import {ComponentInterface} from "../../model/page";

export class Config implements ComponentInterface {
    name: string = 'FlexLayout'
    title: string = "Flex layout"
    icon: string = "ri:layout-4-line"
    group: string = 'Layout'
    properties:FieldConfigInterface[] = [{
            title: "Direction",
            alias: "direction",
            type: "enum",
            default: 'column',
            values: [{
                key: 'row',
                title: 'Row'
            },{
                key: 'column',
                title: 'Column'
            }]
        },
        {
            title: 'Visibility',
            alias: 'visible',
            type: 'handler'
        },
        {
            title: 'Elements',
            alias: 'elements',
            type: 'list',
            listOf: 'element',
            keyProp: 'name',
            displayProp: 'name'
        },
        {
            title: 'Style',
            alias: 'customStyle',
            type: 'string'
        }]
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}
export function properties():FieldConfigInterface[] {
    return
}