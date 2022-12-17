export enum LayoutSize {
    large = 'large',
    small = 'small'
}

export interface LayoutSizeItemInterface {
    size: LayoutSize,
    title: string
}

export function getLayoutSizes($t: any):LayoutSizeItemInterface[] {
    return [{
        size: LayoutSize.large,
        title: $t('layout.largeSize')
    },{
        size: LayoutSize.small,
        title: $t('layout.smallSize')
    }]
}

export interface LayoutComponentInterface {
    alias: string,
    path: string,
}




export class LayoutComponent implements LayoutComponentInterface {
    constructor(alias: string, path: string) {
        this.alias = alias;
        this.path = path;
    }

    alias: string
    path: string
}