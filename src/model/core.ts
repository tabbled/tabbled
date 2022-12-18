import {DataSourceInterface} from "./datasource";

export class Core {
    constructor() {
    }

    dataSources: Map<string, DataSourceInterface[]> = new Map<string, DataSourceInterface[]>()

}