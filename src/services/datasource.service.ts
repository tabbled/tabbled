import { ref } from 'vue'
import {
    DataSourceConfigInterface,
    DataSourceInterface,
    DataSourceType,
    DataSource,
    PageConfigDataSource, MenuConfigDataSource, DataSourceConfigDataSource
} from "../model/datasource";

import {useSyncService} from "./sync.service";

let pagesDataSource = new PageConfigDataSource()
let dsDataSource = new DataSourceConfigDataSource()
let menuDataSource = new MenuConfigDataSource()

let syncService = useSyncService()

export class DataSourceService {
    constructor() { }

    dataSources: Map<string, DataSourceInterface> = new Map()

    registerDataSource(config: DataSourceConfigInterface): DataSourceInterface | undefined {
        if (config.type !== DataSourceType.tableField) {
            let ds = new DataSource(config)
            this.addDataSource(ds);
            return ds;
        } else
            throw 'TableField dataSource cant be registered'
    }

    addDataSource(dataSource: DataSourceInterface) {
        if (this.dataSources.has(dataSource.alias))
            console.warn(`Err: error registration datasource, alias ${dataSource.alias} has been taken`)

        console.log(`DataSource "${dataSource.alias}" registered`)
        this.dataSources.set(dataSource.alias, dataSource);
    }

    clear() {
        this.dataSources.clear();
    }

    getDataSourceByAlias(alias: string): DataSourceInterface | undefined {
        return this.dataSources.get(alias)
    }


    async registerAll() {

        let items = await dsDataSource.getAll()

        items.forEach(ds => {
            this.registerDataSource(<DataSourceConfigInterface>ds)
        })

        syncService.setDataSources(this.dataSources)
    }

    async registerConfig() {
        this.addDataSource(dsDataSource);
        this.addDataSource(pagesDataSource);
        this.addDataSource(menuDataSource);

        syncService.setDataSources(this.dataSources)
    }
}

let dsService = ref<DataSourceService>(new DataSourceService())

export function useDataSourceService(): DataSourceService {
    return dsService.value
}