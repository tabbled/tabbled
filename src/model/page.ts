import {DataSetConfigInterface} from "./dataset";

// export enum PageType {
//     list = 'list',
//     edit = 'edit',
//     kanban = 'kanban',
//     dashboard = 'dashboard'
// }

export type  PageActionType = "default" | "primary" | "success" | "warning" | "info" | "danger"

export enum LayoutSize {
    large = 'large',
    small = 'small'
}

export interface PageActionConfigInterface {
    title: string,
    type?: PageActionType
    script: string
}

export interface LayoutSizeItemInterface {
    size: LayoutSize,
    title: string
}

export function getAvailableLayoutSizes($t: any):LayoutSizeItemInterface[] {
    return [{
        size: LayoutSize.large,
        title: $t('layout.largeSize')
    },{
        size: LayoutSize.small,
        title: $t('layout.smallSize')
    }]
}

export interface PositionElementInterface {
    colFrom: number,
    colTo: number,
    rowFrom: number,
    rowTo: number
}

export interface ElementConfigInterface {
    position: PositionElementInterface,
    component: {
        name: string,
        [key: string]: any
    }
}

export interface PageConfigInterface {
    alias: string,
    path: string,
    title: string,
    //type: PageType,
    component: string,
    dataSets: DataSetConfigInterface[],
    actions?: {
        buttons?: PageActionConfigInterface[],
        advanced?: PageActionConfigInterface[]
    }
    layout?: {
        [key in LayoutSize]: ElementConfigInterface[]
    }
}