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
                default: () => ''
            },
            {
                title: "prop.dataset",
                path: "dataset",
                visible: () => true,
                editor: "select",
                group: "data",
                tooltip: "tooltip.dataset",
                items: async () => {
                    return this.pageProps.datasets.map((d) => {
                        return {
                            key: d.alias,
                            title: d.alias
                        }
                    })
                },
                default: () => null
            },
            {
                title: "prop.height",
                path: "height",
                editor: "input",
                format: "number",
                group: "appearance",
                default: () => 400
            },
            {
                title: "prop.inlineEdit",
                path: "inlineEdit",
                editor: "checkbox",
                group: "interaction",
                default: () => true
            }
        ]
    }
}