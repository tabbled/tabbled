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

    getDatasetInst = (context) => {
        let dataset = context?.parentProps?.dataset
        if (!dataset || !context.dataSets)
            return null

        return context.dataSets[dataset] as DataSet
    }

    propertiesDef = () : PropertyDef[] => {
        return [
            {
                title: "prop.field",
                editor: "select",
                group: "data",
                path: "field",
                default: () => null,
                items: async (context) => {
                    const inst = this.getDatasetInst(context)

                    if (!inst)
                        return []

                    return (await inst.getFields()).map(f => {
                        return { key: f.alias, title: `${f.title} (${f.alias})`}
                    })
                }
            },
            {
                title: "prop.format",
                editor: "input",
                group: "appearance",
                path: "format",
                default: () => '',
                dependsOn: ['field'],
                tooltip: "tooltip.format",
                visible: async (context) => {
                    if (!context.props.field)
                        return false

                    const inst = this.getDatasetInst(context)

                    if (!inst)
                        return false

                    let field = (await inst.getFields()).find(f => f.alias === context.props.field)
                    return field && ['datetime', 'date', 'time', 'number'].includes(field.type)
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
            },{
                title: "prop.wordwrap",
                editor: "checkbox",
                group: "appearance",
                path: "wordwrap",
                default: () => false
            }]
    }

}