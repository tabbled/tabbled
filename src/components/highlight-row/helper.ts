import {ComponentPropertiesHelper, PropertyDef, PropertyGroup} from "../../model/component";
import locales from "./locales"

export default class PropertiesHelper extends ComponentPropertiesHelper {
    groups: PropertyGroup[] = [
        {
            key: "data",
            title: "group.data"
        },
        {
            key: "appearance",
            title: "group.appearance"
        }
    ]

    locales = locales

    propertiesDef = () : PropertyDef[] => {
        return [
            {
                title: "prop.title",
                editor: "input",
                group: "data",
                path: "title",
                default: () => ""
            },
            {
                title: "prop.expression",
                editor: "input",
                group: "data",
                path: "expression",
                tooltip: "tooltip.expression",
                default: () => ""
            },{
                title: "prop.color",
                editor: "color-picker",
                group: "appearance",
                path: "color",
                default: () => []
            }]
    }

}