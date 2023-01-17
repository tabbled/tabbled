import {DataSetConfigInterface} from "./dataset";

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
        title: $t('layout.largeSize')
    },{
        size: ScreenSize.mobile,
        title: $t('layout.smallSize')
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
    properties: {
        [name: string]: any
    }
}

export interface PageConfigInterface {
    _id: string,
    alias: string,
    path: string,
    title: string,
    component: string,
    dataSets: DataSetConfigInterface[],
    elements: ElementInterface[]
}