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

export interface ElementInterface {
    position: {
        colFrom: number,
        colTo: number,
        rowFrom: number,
        rowTo: number
    },
    datasourceAlias?: string,
    fieldAlias?: string,
    title?: string
}

export interface LayoutInterface {
    elements: {
        [key in LayoutSize]: ElementInterface
    }
}