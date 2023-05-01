import {ref, UnwrapRef} from 'vue'
import {
    CustomDataSource,
    DataSource,
    DataSourceConfigDataSource,
    DataSourceConfigInterface,
    DataSourceInterface, DataSourceSource,
    DataSourceType, FieldDataSource, FunctionsConfigDataSource,
    MenuConfigDataSource,
    PageConfigDataSource
} from "../model/datasource";

import {useSyncService} from "./sync.service";
import {useSocketClient} from "./socketio.service";

let pagesDataSource = new PageConfigDataSource(null)
let dsDataSource = new DataSourceConfigDataSource(null)
let menuDataSource = new MenuConfigDataSource(null)
let functionDataSource = new FunctionsConfigDataSource(null)

let syncService = useSyncService()
let socketClient = useSocketClient()

export class DataSourceService {
    constructor() { }

    private dataSources: Map<string, DataSourceInterface> = new Map()
    private configDataSources: Map<string, DataSourceInterface> = new Map()

    async registerDataSource(config: DataSourceConfigInterface): Promise<DataSourceInterface | undefined> {
        let ds: DataSourceInterface = null
        switch (config.source) {
            case DataSourceSource.internal:
                ds = new DataSource(config, socketClient)
                break;
            case DataSourceSource.custom:
                ds = new CustomDataSource(config)
                break;
            case DataSourceSource.field:
                ds = new FieldDataSource(config)
                break;
            default:
                console.log(`DataSource source ${config.source} "${config.alias}" is not implemented yet`)
                return;
        }

        if (ds instanceof  CustomDataSource) {
            try {
                await ds.init()
            } catch (e) {
                console.error(`Error while compiling CustomDataSource "${config.alias}"`)
                console.error(e)
                return
            }

        }

        this.addDataSource(ds);
        return ds;
    }

    getConfigDataSources() {
        return [...this.configDataSources.values()]
    }

    getDataSources() {
        return [...this.dataSources.values()]
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
            default:
                console.error(`Can't register datasource ${dataSource.alias} with type ${dataSource.type}`)
                console.error(dataSource)
                return;
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
        let items = await dsDataSource.getMany()

        items.forEach(ds => {
            this.registerDataSource(<DataSourceConfigInterface>ds)
        })
        syncService.setDataSources(this.dataSources)
    }

    async registerConfig() {
        this.addDataSource(dsDataSource);
        this.addDataSource(pagesDataSource);
        this.addDataSource(menuDataSource);
        this.addDataSource(functionDataSource);

        syncService.setConfigDataSources(this.configDataSources)
    }
}

export class DataSourceScriptHelper {
    constructor() {
    }

    getByAlias(alias: string) {
        return dsService.value.getDataSourceByAlias(alias)
    }
}

let dsService = ref<DataSourceService>(new DataSourceService())
let dsScriptHelper = ref<DataSourceScriptHelper>(new DataSourceScriptHelper())

export function useDataSourceService(): UnwrapRef<DataSourceService> {
    return dsService.value
}

export function useDataSourceScriptHelper(): UnwrapRef<any> {
    return dsScriptHelper.value
}