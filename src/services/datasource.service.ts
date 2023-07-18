import {ref, UnwrapRef} from 'vue'
import {
    CustomDataSource,
    DataSource,
    DataSourceConfigDataSource,
    DataSourceConfigInterface,
    DataSourceInterface, DataSourceSource,
    DataSourceType, FieldDataSource, FunctionsConfigDataSource,
    MenuConfigDataSource, PageConfigDataSource, ReportConfigDataSource
} from "../model/datasource";

import {useSyncService} from "./sync.service";
import {useSocketClient} from "./socketio.service";

let syncService = useSyncService()
let socketClient = useSocketClient()

export class DataSourceService {
    constructor() { }

    private dataSourceConfigs: Map<string, DataSourceConfigInterface> = new Map()
    private dataSources: Map<string, DataSourceInterface> = new Map()
    private configDataSources: Map<string, DataSourceInterface> = new Map()

    pageDataSource = new PageConfigDataSource(null)
    dsDataSource = new DataSourceConfigDataSource(null)
    menuDataSource = new MenuConfigDataSource(null)
    functionDataSource = new FunctionsConfigDataSource(null)
    reportDataSource = new ReportConfigDataSource(null)

    async getByAlias(alias: string) : Promise<DataSourceInterface> {
        if (this.dataSources.has(alias)) {
            return this.dataSources.get(alias)
        }

        let config = this.dataSourceConfigs.get(alias);
        if (!config)
            return undefined;

        let ds = null
        switch (config.source) {
            case DataSourceSource.internal:
                ds = new DataSource(config, socketClient)
                break;
            case DataSourceSource.custom:
                ds = new CustomDataSource(config)
                try {
                    await ds.init()
                } catch (e) {
                    console.error(`Error while compiling CustomDataSource "${config.alias}"`)
                    console.error(e)
                    return undefined
                }
                break;
            case DataSourceSource.field:
                ds = new FieldDataSource(config)
                break;
            default:
                console.log(`DataSource source ${config.source} "${config.alias}" is not implemented yet`)
                return;
        }

        this.addDataSource(ds);

        return ds;
    }

    getConfigDataSources() {
        return [...this.configDataSources.values()]
    }

    getDataSources() {
        return [...this.dataSourceConfigs.values()]
    }

    addDataSource(dataSource: DataSourceInterface) {
        let target;
        switch (dataSource.type) {
            case DataSourceType.config:
                target = this.configDataSources;
                break;
            case DataSourceType.data:
                target = this.dataSources;
                break
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

        this.dataSources.set(dataSource.alias, dataSource)
    }

    clear(type: DataSourceType) {
        switch (type) {
            case DataSourceType.config:
                this.configDataSources.clear();
                break;
            case DataSourceType.data:
                break;
        }
    }


    async registerAll() {
        let items = (await this.dsDataSource.getMany()).data

        items.forEach(ds => {
            this.dataSourceConfigs.set(ds.alias, <DataSourceConfigInterface>ds)
        })
    }

    async registerConfig() {
        this.addDataSource(this.dsDataSource);
        this.addDataSource(this.pageDataSource);
        this.addDataSource(this.menuDataSource);
        this.addDataSource(this.functionDataSource);
        this.addDataSource(this.reportDataSource)

        syncService.setConfigDataSources(this.configDataSources)
    }
}

export class DataSourceScriptHelper {
    constructor() {
    }

    async getByAlias(alias: string) {
        return await dsService.value.getByAlias(alias)
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