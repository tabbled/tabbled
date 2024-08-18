export type EditorComponent = 'select' | 'input' | 'input-number' | 'text' | 'code' | 'checkbox' | 'list'
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
    group: string
    items?: () => Promise<SelectItem[]>
    default: () => any
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

export class Component {
    title: string
    name: string
    icon: string
    group: string
}