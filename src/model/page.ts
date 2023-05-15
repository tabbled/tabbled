import {EventHandlerConfigInterface, FieldConfigInterface, FieldListOfType} from "./field";
import {columnProperties} from "./column";

export type  PageActionType = "default" | "primary" | "success" | "warning" | "info" | "danger"

export enum ScreenSize {
    desktop = 'desktop',
    mobile = 'mobile'
}

export interface PageActionConfigInterface {
    title: string,
    type?: PageActionType
    onClick: string
}

export interface ScreenSizeItemInterface {
    size: ScreenSize,
    title: string
}

export function getAvailableScreenSizes($t: any):ScreenSizeItemInterface[] {
    return [{
        size: ScreenSize.desktop,
        title: $t('layout.desktop')
    },{
        size: ScreenSize.mobile,
        title: $t('layout.mobile')
    }]
}

export interface PositionElementInterface {
    colFrom: number,
    colTo: number,
    rowFrom: number,
    rowTo: number,
    visible?: boolean
}

export interface ElementInterface {
    id: string,
    layout: {
        [key in ScreenSize]: PositionElementInterface
    },
    name: string,
    field: string,
    props: any,
    filterable?: boolean
}

export interface ComponentInterface {
    name: string,
    title: string,
    icon?: string,
    group?: string,
    properties: FieldConfigInterface[],
    filterable?: boolean,
    defaultPosition: {
        cols: number,
        rows: number
    }
}

export interface PageConfigInterface {
    id: string,
    alias: string,
    path: string,
    title: string,
    elements: ElementInterface[]
    onOpen: EventHandlerConfigInterface,
    headerActions: PageActionConfigInterface[],
    isEditPage: boolean
    datasource?: string
}

interface PageListItemTypeInterface {
    alias: FieldListOfType
    propPath: string,
    fields: FieldConfigInterface[]
}

export class PageTypesProperties {
    constructor() {
        this._types = new Map<FieldListOfType, PageListItemTypeInterface>()
        this._types.set('column', {
            alias: 'column',
            propPath: '',
            fields: columnProperties
        })
        this._types.set('action', {
            alias: 'action',
            propPath: '',
            fields: actionProperties
        })

    }
    private _types: Map<FieldListOfType, PageListItemTypeInterface>

    getPropertiesByType(type: FieldListOfType) {
        return this._types.get(type);
    }
}

export const actionProperties:FieldConfigInterface[] = [
    {
        title: 'Alias',
        alias: 'alias',
        type: "string",
        required: true
    },
    {
        title: 'Title',
        alias: 'title',
        type: "string",
        required: true
    },
    {
        title: "onClick",
        alias: "onClick",
        type: 'handler'
    }
    ]

export const pageProperties:FieldConfigInterface[] = [
    {
        title: 'Title',
        alias: 'title',
        type: "string",
        required: true
    },
    {
        title: 'Path',
        alias: 'path',
        type: "string",
        required: true
    },
    {
        title: 'Alias',
        alias: 'alias',
        type: "string",
        required: true
    },
    {
        title: "Is edit page",
        alias: "isEditPage",
        type: 'bool',
        tooltip: 'Form validation is enabled',
        default: false
    },
    {
        title: "Editing data source",
        alias: "datasource",
        type: 'datasource',
        tooltip: 'DataSource that will be controlled with form validating',
        default: null
    },
    {
        title: 'Elements',
        alias: 'elements',
        type: 'list',
        listOf: 'element',
        keyProp: 'name',
        displayProp: 'name'
    },
    {
        title: "Header actions",
        alias: "headerActions",
        type: 'list',
        listOf: 'action',
        keyProp: 'alias',
        displayProp: 'alias',
    },
    {
        title: "onOpen",
        alias: "onOpen",
        type: 'handler'
    }
]