import {ComponentPropertiesHelper, PropertyDef, PropertyGroup} from "../../model/component";
import locales from "./locales"
import {DataSet} from "../dataset";

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
                title: "prop.field",
                editor: "select",
                group: "data",
                path: "field",
                default: () => null,
                items: async (context) => {
                    let dataset = context?.parentProps?.dataset
                    if (!dataset || !context.dataSets)
                        return []

                    let inst = context.dataSets[dataset] as DataSet

                    return (await inst.getFields()).map(f => {
                        return { key: f.alias, title: `${f.title} (${f.alias})`}
                    })
                }
            },
            {
                title: "prop.format",
                editor: "select",
                group: "data",
                path: "format",
                default: () => 'string',
                items: async () => {
                    return [{
                        title: "String",
                        key: "string"
                    },{
                        title: "Number",
                        key: "number"
                    }]
                }
            },{
                title: "prop.title",
                editor: "input",
                group: "appearance",
                path: "title",
                default: () => 'New  column'
            },{
                title: "prop.width",
                editor: "input-number",
                group: "appearance",
                path: "width",
                default: () => 150
            },{
                title: "prop.minWidth",
                editor: "input-number",
                group: "appearance",
                path: "minWidth",
                default: () => 20
            },{
                title: "prop.sortable",
                editor: "checkbox",
                group: "interaction",
                path: "sortable",
                default: () => false
            }]
    }

}