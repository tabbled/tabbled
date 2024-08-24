import {PageConfigInterfaceV2} from "./page";

export type EditorComponent =
    'select' |
    'input' |
    'input-number' |
    'text' |
    'code' |
    'checkbox' |
    'list' |
    'dataset-list' |
    'event-handler-list'
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

    setProperties(props: any, pageProps: PageConfigInterfaceV2) {
        this.props = props
        this.pageProps = pageProps
    }

    props: any
    pageProps: PageConfigInterfaceV2
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