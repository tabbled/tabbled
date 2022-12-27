import {ColumnConfigInterface} from "./column";

// export enum PageType {
//     list = 'list',
//     edit = 'edit',
//     kanban = 'kanban',
//     dashboard = 'dashboard'
// }

export enum LayoutSize {
    large = 'large',
    small = 'small'
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
        dataSource?: string,
        columns?: ColumnConfigInterface[]
    }
}

export interface PageConfigInterface {
    alias: string,
    path: string,
    title: string,
    //type: PageType,
    component: string,
    dataSource: string,
    layout?: {
        [key in LayoutSize]: ElementConfigInterface[]
    }
}


export interface PageInterface {
    alias: string,
    path: string,
    title: string,
    layout?: {
        [key in LayoutSize]: ElementConfigInterface[]
    },
    config: PageConfigInterface
}

export class EditPage implements PageInterface {
    constructor(config: PageConfigInterface, component: any) {
        this.path = config.path;
        this.alias = config.alias;
        this.layout = config.layout;
        this.component = component;
        this.title = config.title;
        this.config = config
    }

    config: PageConfigInterface;
    path: string;
    title: string;
    component: any;
    alias: string;
    layout?: {
        [key in LayoutSize]: ElementConfigInterface[]
    }
}