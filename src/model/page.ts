import {ElementInterface, LayoutInterface} from "./layout";
import {DataSourceInterface} from "./datasource";

export interface PageConfigInterface {
    alias: string,
    title: string,
    layout: LayoutInterface,
    dataSourceAlias: string
}


export interface PageInterface {
    alias: string,
    layout: LayoutInterface
    dataSource: DataSourceInterface

    getAvailableElements() : ElementInterface[]
}

export class EditPage implements PageInterface {
    constructor(config: PageConfigInterface, dataSource: DataSourceInterface) {
        this.alias = config.alias
        this.dataSource = dataSource
        this.layout = config.layout
    }

    alias: string;
    dataSource: DataSourceInterface;
    layout: LayoutInterface;

    getAvailableElements(): ElementInterface[] {
        return [];
    }
}