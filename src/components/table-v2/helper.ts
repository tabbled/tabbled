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
                visible: async () => true,
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
                title: "prop.columns",
                path: "columns",
                visible: async () => true,
                editor: "column-list",
                group: "data",
                default: () => []
            },
            {
                title: "prop.height",
                path: "height",
                editor: "input",
                group: "appearance",
                default: () => "100%",
                tooltip: "tooltip.height",
            },
            {
                title: "prop.inlineEdit",
                path: "inlineEdit",
                editor: "checkbox",
                group: "interaction",
                default: () => true
            },
            {
                title: "prop.highlightRow",
                path: "highlightRow",
                editor: "highlight-list",
                group: "appearance",
                tooltip: "tooltip.highlightRow",
                default: () => []
            }
        ]
    }
}