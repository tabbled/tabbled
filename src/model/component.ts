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
    'event-handler-list' |
    'column-list' |
    'field-list' |
    'highlight-list' |
    'color-picker'
export class SelectItem {
    key: string
    title: string
}

export class PropertyDef {
    title: string
    path: string
    editor: EditorComponent
    format?: 'string' | 'number'
    visible?: (context?) => Promise<boolean>
    tooltip?: string
    group: string
    items?: (context?) => Promise<SelectItem[]>
    default: () => any
    dependsOn?: string[] // path of properties, if visibility or another value need to update,
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