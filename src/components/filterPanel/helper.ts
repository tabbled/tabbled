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
                title: "prop.dataset",
                editor: "select",
                group: "data",
                path: "dataset",
                default: () => null,
                items: async () => {
                    return this.pageProps.datasets.map((d) => {
                        return {
                            key: d.alias,
                            title: d.alias
                        }
                    })
                }
            },{
                title: "prop.items",
                editor: "input",
                group: "data",
                path: "items",
                default: () => []
            },{
                title: "prop.title",
                editor: "input",
                group: "appearance",
                path: "title",
                default: () => ""
            }]
    }

}