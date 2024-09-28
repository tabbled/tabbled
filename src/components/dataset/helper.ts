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
                title: "prop.fields",
                editor: "field-list",
                group: "data",
                path: "fields",
                default: () => [],
            },{
                title: "prop.datasource",
                editor: "select",
                group: "data",
                path: "datasource",
                default: () => null,
                items: async (context) => {
                    return []
                }
            },{
                title: "prop.alias",
                editor: "input",
                group: "interaction",
                path: "alias",
                default: () => 'dataSet'
            }]
    }

}