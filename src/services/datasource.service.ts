import {ref, UnwrapRef} from 'vue'
import {
    DataSource,
    DataSourceConfigDataSource,
    DataSourceConfigInterface,
    DataSourceInterface,
    DataSourceType,
    MenuConfigDataSource,
    PageConfigDataSource
} from "../model/datasource";

import {useSyncService} from "./sync.service";

let pagesDataSource = new PageConfigDataSource()
let dsDataSource = new DataSourceConfigDataSource()
let menuDataSource = new MenuConfigDataSource()

let syncService = useSyncService()

export class DataSourceService {
    constructor() { }

    private dataSources: Map<string, DataSourceInterface> = new Map()
    private configDataSources: Map<string, DataSourceInterface> = new Map()

    registerDataSource(config: DataSourceConfigInterface): DataSourceInterface | undefined {
        if (config.type !== DataSourceType.tableField) {
            let ds = new DataSource(config)
            this.addDataSource(ds);
            return ds;
        } else
            throw 'TableField dataSource cant be registered'
    }

    addDataSource(dataSource: DataSourceInterface) {
        let target;
        switch (dataSource.type) {
            case DataSourceType.config:
                target = this.configDataSources;
                break;
            case DataSourceType.data:
                target = this.dataSources
                break;
        }

        if (target.has(dataSource.alias)) {
            console.warn(`Err: error registration datasource, alias ${dataSource.alias} has been taken`)
        }
        console.log(`DataSource "${dataSource.alias}" registered`)
        target.set(dataSource.alias, dataSource);

    }

    clear(type: DataSourceType) {
        switch (type) {
            case DataSourceType.config:
                this.configDataSources.clear();
                break;
            case DataSourceType.data:
                this.dataSources.clear();
                break;
        }
    }

    getDataSourceByAlias(alias: string): DataSourceInterface | undefined {
        return this.dataSources.get(alias) || this.configDataSources.get(alias)
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

        syncService.setConfigDataSources(this.configDataSources)
    }
}

let dsService = ref<DataSourceService>(new DataSourceService())

export function useDataSourceService(): UnwrapRef<DataSourceService> {
    return dsService.value
}