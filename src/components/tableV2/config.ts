import {ComponentInterface} from "../../model/page";
import {FieldConfigInterface} from "../../model/field";
import {ComponentPropertiesHelper, PropertiesDef} from "../../model/component";

export enum DatasourceType {
    datasource = "datasource",
    function = "function"
}

export class PropertiesHelper extends ComponentPropertiesHelper {
    propertiesDef = () : PropertiesDef => {
        return {
            title: {
                title: "Title",
                editor: "input",
                group: "general",
            },
            datasourceType: {
                title: "Type of datasource",
                editor: "select",
                group: "general",
                items: async () => [{
                    key: "datasource",
                    title: "Data source"
                },{
                    key: "function",
                    title: "Function"
                },{
                    key: "static",
                    title: "Static"
                }],
            },
            datasourceAlias: {
                title: "Data source",
                visible: () => { return this.props.datasourceType === 'datasource' },
                editor: "select",
                group: "general",
                tooltip: "This is **markdown** hint for this property",
                items: async () => {
                    return [{
                        key: "",
                        title: ""
                    }]
                }
            }
        }

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