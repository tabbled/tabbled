import {ComponentPropertiesHelper, PropertyDef, PropertyGroup} from "../../model/component";
import locales from "./locales"

export default class PropertiesHelper extends ComponentPropertiesHelper {
    groups: PropertyGroup[] = [
        {
            key: "data",
            title: "group.data"
        },
        {
            key: "interaction",
            title: "group.interaction"
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
                group: "appearance",
                format: "string",
                path: "title",
                default: () => 'Page'
            },
            {
                title: "prop.alias",
                editor: "input",
                group: "data",
                format: "string",
                path: "alias",
                default: () => ''
            },{
                title: "prop.dataSets",
                editor: "list",
                group: "data",
                path: "alias",
                default: () => []
            }]
    }

}