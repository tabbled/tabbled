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
                title: "prop.typeOfDatasource",
                editor: "select",
                path: "datasourceType",
                group: "data",
                tooltip: "tooltip.datasourceType",
                items: async () => [{
                    key: "datasource",
                    title: "Data source"
                },{
                    key: "script",
                    title: "Script"
                },{
                    key: "value",
                    title: "Value"
                }],
                default: () => 'datasource'
            },
            {
                title: "prop.datasource",
                path: "datasource",
                visible: () => this.props.datasourceType === 'datasource',
                editor: "select",
                group: "data",
                tooltip: "tooltip.datasource",
                items: async () => {

                    return [{
                        key: "ds",
                        title: "ds"
                    }]
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