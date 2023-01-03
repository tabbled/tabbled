import { ref } from 'vue'
import {
    DataSourceConfigInterface,
    DataSourceInterface,
    DataSourceType,
    DataSource,
    PageConfigDataSource
} from "../model/datasource";
import { Store } from "vuex";

let pagesDataSource = ref<PageConfigDataSource>()

export class DataSourceService {
    dataSources: Map<string, DataSourceInterface> = new Map<string, DataSourceInterface>()

    constructor() {
    }

    registerDataSource(config: DataSourceConfigInterface): DataSourceInterface | undefined {
        if (config.type === DataSourceType.entity) {
            let ds = new DataSource(config)

            if (this.dataSources.has(config.alias))
                throw `Err: error registration datasource, alias ${config.alias} has been taken`

            this.dataSources.set(config.alias, ds);
            return ds;
        } else
            throw 'Unknown data source type ' + config.type;
    }

    addDataSource(dataSource: DataSourceInterface) {
        if (this.dataSources.has(dataSource.alias))
            throw `Err: error registration datasource, alias ${dataSource.alias} has been taken`

        this.dataSources.set(dataSource.alias, dataSource);
    }

    clear() {
        this.dataSources.clear();
    }

    getDataSourceByAlias(alias: string): DataSourceInterface | undefined {
        return this.dataSources.get(alias)
    }


    registerAll(store: Store<any>) {
        this.clear();
        // Register user's dataSources
        store.getters['config/dataSources'].forEach( (ds: DataSourceConfigInterface) => {
            this.registerDataSource(ds)
        })

        // Add system dataSources
        pagesDataSource.value = new PageConfigDataSource()
        this.addDataSource(pagesDataSource.value);
    }
}

let dsService = ref<DataSourceService>(new DataSourceService())

export function useDataSourceService(): DataSourceService {
    return dsService.value
}