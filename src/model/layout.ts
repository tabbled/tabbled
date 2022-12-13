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