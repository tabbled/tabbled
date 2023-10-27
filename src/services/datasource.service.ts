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

import {ServerInterface, useSocketClient} from "./socketio.service";
import {UsersConfigDataSource} from "../model/user.datasource";

let socketClient = useSocketClient()

export class DataSourceService {
    constructor() {
        this.server = useSocketClient()
        this.pageDataSource = new PageConfigDataSource(this.server, this)
        this.dsDataSource = new DataSourceConfigDataSource(this.server, this)
        this.menuDataSource = new MenuConfigDataSource(this.server, this)
        this.functionDataSource = new FunctionsConfigDataSource(this.server, this)
        this.reportDataSource = new ReportConfigDataSource(this.server, this)
        this.usersDataSource = new UsersConfigDataSource(this.server, this)
    }
    private readonly server: ServerInterface

    private dataSourceConfigs: Map<string, DataSourceConfigInterface> = new Map()
    private dataSources: Map<string, DataSourceInterface> = new Map()
    private configDataSources: Map<string, DataSourceInterface> = new Map()
    pageDataSource = null
    dsDataSource = null
    menuDataSource = null
    functionDataSource = null
    reportDataSource = null
    usersDataSource = null


    async getByAlias(alias: string) : Promise<DataSourceInterface> {
        if (!alias)
            return undefined

        if (this.dataSources.has(alias)) {
            return this.dataSources.get(alias)
        }

        let ds = await this.create(alias)
        if (ds)
            this.addDataSource(ds);

        return ds;
    }

    async create(alias: string) {
        let config = this.dataSourceConfigs.get(alias);

        if (!config)
            return undefined;

        let ds
        switch (config.source) {
            case DataSourceSource.internal:
                ds = new DataSource(config, socketClient, this)
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
                ds = new FieldDataSource(config, this)
                break;
            default:
                console.log(`DataSource source ${config.source} with alias "${config.alias}" is unknown`)
                return undefined
        }

        return ds
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
        this.addDataSource(this.usersDataSource)
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