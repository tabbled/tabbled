
export type ComponentPropGroups = 'general' | string
export type EditorComponent = 'select' | 'input' | 'text' | 'code'
export class SelectItem {
    key: string
    title: string
}

export class PropertyDef {
    title: string
    path: string
    editor: EditorComponent
    format?: 'string' | 'number'
    visible?: () => boolean
    tooltip?: string
    group: ComponentPropGroups
    items?: () => Promise<SelectItem[]>
}

export class PropertyGroup {
    key: string
    title: string
}

export class ComponentPropertiesHelper {
    constructor(props?: any) {
        this.props = props
    }

    setProperties(props: any) {
        this.props = props
    }

    props: any
    propertiesDef: () => PropertyDef[]
    groups: PropertyGroup[]

    getAliases = () : string[] =>  {
        return Object.keys(this.propertiesDef())
    }

    locales: {
        [k in string]: any
    }
}