import {EventHandlerConfigInterface, FieldConfigInterface, FieldListOfType} from "./field";
import {columnProperties} from "./column";
import {CompiledFunc} from "../services/compiler";
import {AccessType} from "./permissions";
import {DataSetParamsInterface} from "../components/dataset";

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
    colFrom?: number,
    colTo?: number,
    rowFrom?: number,
    rowTo?: number,
    visible?: boolean
}

export interface ConfigField extends FieldConfigInterface{
    isVisible?: (s: object) => boolean
}

/*
deprecated
 */
export interface ElementInterface {
    id: string,
    layout: {
        [key in ScreenSize]: PositionElementInterface
    },
    name: string,
    field: string,
    fieldConfig?: FieldConfigInterface,
    fieldValue?: any
    props: any,
    filterable?: boolean,
    elements?: ElementInterface[]
    isVisible?: boolean
    visibleFunc?:  CompiledFunc
}

export interface ElementInterfaceV2 {
    id: string,
    componentName: string,
    properties: any,
    elements?: ElementInterfaceV2[],
    colSpan: number
    visible?: (ctx: any) => boolean
}

export interface ComponentInterface {
    name: string,
    title: string,
    icon?: string,
    group?: string,
    properties: ConfigField[],
    filterable?: boolean, // If component can be filtered, then it must have property 'filters'
    defaultPosition: {
        cols: number,
        rows: number
    }
}

export interface OpenDialogOptions {
    page: string,
    title?: string,
    id?: string,
    modal?: boolean,
    width?: number,
    selecting?: boolean,
    onClose?: Function,
    onSelect?: Function,
    onOpen?: Function
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
    datasource?: string,
    access: AccessType,
    accessRoles: string[],
    type?: 'edit' | 'list' | 'dashboard' | 'select'
}

export interface PageConfigInterfaceV2 {
    id: string,
    alias: string,
    title: string,
    elements: ElementInterfaceV2[]
    headerActions: PageActionConfigInterface[],
    permissions: {
        access: AccessType,
        accessRoles: string[],
    }
    type: 'edit' | 'list' | 'dashboard' | 'select'
    datasets: DataSetParamsInterface[]
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
        this._types.set('rule', {
            alias: 'rule',
            propPath: '',
            fields: ruleProperties
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

export const ruleProperties:FieldConfigInterface[] = [
    {
        title: 'Title',
        alias: 'title',
        type: "string",
        required: true
    },
    {
        title: "Expression",
        alias: "expression",
        type: 'handler'
    },
    {
        title: "Style",
        alias: "style",
        type: 'text'
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
    },
    {
        title: "Access",
        alias: "access",
        type: 'enum',
        default: 'all',
        values: [{
            key: 'all',
            title: "All"
        },{
            key: 'roles',
            title: "Roles"
        },{
            key: 'nobody',
            title: "Nobody"
        }]
    },{
        title: "Roles",
        alias: "accessRoles",
        type: 'role',
        isMultiple: true
    }
]