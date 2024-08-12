
export type ComponentPropGroups = 'general' | string
export type EditorComponent = 'select' | 'input' | 'text' | 'code'
export class SelectItem {
    key: string
    title: string
}

export class PropertyDef {
    title: string
    editor: EditorComponent
    visible?: () => boolean
    tooltip?: string
    group: ComponentPropGroups
    items?: () => Promise<SelectItem[]>
}

export class PropertiesDef {
    [name: string]: PropertyDef
}

export class ComponentPropertiesHelper {
    constructor(props: any) {
        this.props = props
    }

    props: any
    propertiesDef: () => PropertiesDef

    getAliases = () : string[] =>  {
        return Object.keys(this.propertiesDef())
    }

    onPropertyChange: (prop: string, value: any) => void

    setPropertyValue = (prop: string, value: any) => {
        console.log(prop, value)
        if (this.onPropertyChange) {
            this.onPropertyChange(prop, value)
        }
    }
}