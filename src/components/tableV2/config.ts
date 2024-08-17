import {ComponentInterface} from "../../model/page";
import {FieldConfigInterface} from "../../model/field";
import {ComponentPropertiesHelper, PropertyDef, PropertyGroup} from "../../model/component";
import locales from "./locales"

export enum DatasourceType {
    datasource = "datasource",
    function = "function"
}

export class PropertiesHelper extends ComponentPropertiesHelper {
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
                group: "appearance",
                format: "string",
                path: "title",
                visible: () => true
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
                }
            },
            {
                title: "prop.height",
                path: "height",
                editor: "input",
                format: "number",
                group: "appearance",
            }
        ]
    }
}

export class Config implements ComponentInterface {
    name = 'TableV2'
    title = "Table v2"
    icon = "mdi:table"
    group  = 'Fields'
    filterable = true
    properties: FieldConfigInterface[] = []
    defaultPosition = {
        rows: 1,
        cols: 12
    }
}