import {DataSetConfigInterface, dataSetProperties} from "./dataset";
import {FieldConfigInterface, FieldListOfType} from "./field";
import {columnProperties} from "./column";

export type  PageActionType = "default" | "primary" | "success" | "warning" | "info" | "danger"

export enum ScreenSize {
    desktop = 'desktop',
    mobile = 'mobile'
}

export interface PageActionConfigInterface {
    title: string,
    type?: PageActionType
    script: string
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
    layout: {
        [key in ScreenSize]: PositionElementInterface
    },
    name: string,
    // properties: {
    //     [name: string]: any | undefined
    // }
    //[name: string]: any | undefined
}

export interface ComponentInterface {
    name: string,
    title: string,
    icon?: string,
    properties: FieldConfigInterface[],
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
    dataSets: DataSetConfigInterface[],
    elements: ElementInterface[]
}

interface PageListItemTypeInterface {
    alias: FieldListOfType
    propPath: string,
    fields: FieldConfigInterface[]
}

export class PageTypesProperties {
    constructor() {
        this._types = new Map<FieldListOfType, PageListItemTypeInterface>()
        this._types.set('dataset', {
            alias: 'dataset',
            propPath: '',
            fields: dataSetProperties
        })
        this._types.set('column', {
            alias: 'column',
            propPath: '',
            fields: columnProperties
        })

    }
    private _types: Map<FieldListOfType, PageListItemTypeInterface>

    getPropertiesByType(type: FieldListOfType) {
        return this._types.get(type);
    }
}

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
        title: 'DataSets',
        alias: 'dataSets',
        type: 'list',
        listOf: "dataset",
        keyProp: 'alias',
        displayProp: 'alias',
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
        title: "onOpen",
        alias: "onOpen",
        type: 'handler'
    }
]