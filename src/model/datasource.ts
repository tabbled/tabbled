import {Field, FieldConfigInterface, FieldInterface} from "./field";
import _ from 'lodash'
import {compileScript} from "../services/compiler";
import {EventEmitter} from "events";
import {ServerInterface} from "../services/socketio.service";
import {FilterItemInterface} from "./filter";


export enum DataSourceType {
    config = 'config',
    data = 'data',
}

export enum DataSourceSource {
    internal = 'internal',
    custom = 'custom',
    restapi = 'restapi',
    sql = 'sql',
    field = 'field'
}

export interface EntityInterface {
    [name: string]: any | never
}

export interface GetManyResponse {
    data: EntityInterface[],
    count: number
}



export interface GetDataManyOptions {
    filter?: FilterItemInterface[],
    fields?: string[],
    search?: string
    take?: number
    skip?: number
    sort?: {
        field: string
        ask: boolean
    }
    include?: string[]
    parentId?: string,
    id?: string[],
    route?:string[]
}

export interface DataSourceInterface extends EventEmitter {
    readonly: boolean,
    alias: string,
    isTree?: boolean,
    fields: FieldInterface[],
    cached: boolean,
    keyField: string,
    type: DataSourceType
    source: DataSourceSource

    /**
     * Get data with filters and pagination
     * @returns {EntityInterface[]} data from data source
     */
    getMany(options?: GetDataManyOptions): Promise<GetManyResponse>

    /**
     * Return entity data by row
     * @param id entity id
     * @returns entity if exists or null if not exists
     */
    getById(id: string | number) : Promise<EntityInterface | undefined>


    insert(id: string, value: any, parentId?: string): Promise<EntityInterface>
    updateById(id: string, value: object): Promise<EntityInterface>
    removeById(id: string): Promise<boolean>

    // Sync Service use this method when got data from server
    //setRemoteChanges?(item: DataItemInterface[]): Promise<boolean>

    // Set items
    //get data(): EntityInterface[]
    setData?(items: EntityInterface[]): Promise<void>
    setValue(id: string, field: string, value: any): Promise<void>

    getFieldByAlias(alias: string): FieldInterface | undefined

}

export interface DataSourceConfigInterface {
    fields: FieldConfigInterface[],
    type: DataSourceType,
    title?: string,
    alias: string,
    readonly?: boolean,
    keyField?: string,
    isTree?: boolean,
    source?: DataSourceSource,
    script?: string,
    cached?: boolean
}

export class DataSource extends EventEmitter implements DataSourceInterface {
    constructor(config: DataSourceConfigInterface, server: ServerInterface) {
        super()
        this.fieldByAlias = new Map()
        this.alias = config.alias
        this.keyField = config.keyField
        this.type = config.type
        this.config = config
        this.source = DataSourceSource.internal
        this.fields = []
        this.readonly = !!config.readonly ? config.readonly : false
        this.isTree = config.isTree
        this.cached = config.cached
        this.server = server
        this.title = config.title


        config.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        if (this.fieldByAlias.size > 0)
            this.fields = [...this.fieldByAlias.values()]

    }

    private fieldByAlias: Map<string, FieldInterface>
    private config: DataSourceConfigInterface
    private server: ServerInterface = null

    alias: string;
    fields: FieldInterface[];
    keyField: string;
    cached = true;
    readonly = false
    type: DataSourceType
    source: DataSourceSource
    isTree: boolean
    title: string

    async getMany(options: GetDataManyOptions = {}): Promise<GetManyResponse> {

        //let dt = new Date().getMilliseconds()
        //console.log(this.alias + ".getMany from server, options: ", options)
        let data = await this.server.emit(`${this.type === 'config' ? 'config' : 'dataSources/data'}/getMany`, {
            alias: this.alias,
            options: options
        })
        //console.log(`${this.alias}, got items: ${data.items.length}; timing, ms: ${new Date().getMilliseconds() - dt}`)

        return {
            data: data.items,
            count: data.count
        }

    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getById(id: string): Promise<EntityInterface | undefined> {
        if (!id)
            return null

        return await this.server.emit(`${this.type === 'config' ? 'config' : 'dataSources/data'}/getById`, {
            alias: this.alias,
            id: id
        })

    }

    async getByKey(key: string | number) : Promise<EntityInterface | undefined> {
        if (!key)
            return null

        return await this.server.emit(`${this.type === 'config' ? 'config' : 'dataSources/data'}/getByKey`, {
            alias: this.alias,
            key: key
        })
    }

    async insert(id: string, value: any, parentId?: string): Promise<EntityInterface> {

        let dt = new Date().getMilliseconds()
        console.log(this.alias, " insert")

        if (this.isTree) {
            value.parentId = parentId
        }

        let res = await this.server.emit(`${this.type === 'config' ? 'config' : 'dataSources/data'}/insert`, {
            alias: this.alias,
            id: id,
            parentId: this.isTree ? parentId : null,
            value: value
        })
        console.log(this.alias, " inserted; timing, ms: ", new Date().getMilliseconds() - dt)

        this.emit('item-inserted', {
            data: value
        })
        return res


    }

    async updateById(id: string, value: object): Promise<EntityInterface> {

        let res = await this.server.emit(`${this.type === 'config' ? 'config' : 'dataSources/data'}/updateById`, {
            alias: this.alias,
            id: id,
            value: value
        })

        this.emit('item-updated', {
            data: res.data
        })
        return res

    }

    async removeById(id: string): Promise<boolean> {
        let dt = new Date().getMilliseconds()
        let res = await this.server.emit(`${this.type === 'config' ? 'config' : 'dataSources/data'}/removeById`, {
            alias: this.alias,
            id: id
        })
        console.log(this.alias, "removed; timing, ms: ", new Date().getMilliseconds() - dt)

        this.emit('item-removed', {
            data: res.data
        })

        return true
    }

    //async setRemoteChanges(items: DataItemInterface[]):Promise<boolean> {
        // if (!db.database)
        //     return false;
        //
        // console.log(`DataSource ${this.alias} got remote changes, count: ${items.length}`)
        //
        // for(const i in items) {
        //     const item = items[i]
        //     let current_item = await this.getByIdRaw(item.id)
        //
        //     await db.database.ref(`/${this.type}/${this.alias}/${item.id}`).update(item)
        //
        //
        //     if (!current_item) {
        //         this.emit('item-inserted', {
        //             data: current_item.data
        //         })
        //     } else {
        //         this.emit('item-updated', {
        //             data: item.data
        //         })
        //
        //         if (item.deletedAt && !current_item.deletedAt) {
        //             this.emit('item-removed', {
        //                 data: item.data
        //             })
        //         }
        //     }
        // }
        // this.emit('update')
    //     return true
    // }

    async setValue(id: string, field: string, value: any) {

        let dt = new Date().getMilliseconds()
        let res = await this.server.emit(`${this.type === 'config' ? 'config' : 'dataSources/data'}/setValue`, {
            alias: this.alias,
            id: id,
            field: field,
            value: value
        })
        console.log(this.alias, "updated; timing, ms: ", new Date().getMilliseconds() - dt)

        this.emit('item-updated', {
            data: res.data
        })

    }
}

export class CustomDataSource extends EventEmitter implements DataSourceInterface {
    alias: string;
    cached: boolean = false;
    fields: FieldInterface[];
    isTree: boolean;
    keyField: string;
    readonly: boolean = false;
    source: DataSourceSource = DataSourceSource.custom;
    type: DataSourceType = DataSourceType.data;
    context: any = {}
    model: any = null
    script: string = ""
    _emitHandler = this.emitHandler.bind(this)

    private fieldByAlias: Map<string, FieldInterface>
    private config: DataSourceConfigInterface

    constructor(config: DataSourceConfigInterface) {
        super()
        this.alias = config.alias
        this.keyField = config.keyField
        this.config = config
        this.fields = []
        this.fieldByAlias = new Map()
        this.isTree = !!config.isTree
        this.readonly = !!config.readonly
        this.script = config.script

        //console.log(config)

        config.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        if (this.fieldByAlias.size > 0)
            this.fields = [...this.fieldByAlias.values()]
    }

    async setData(items: EntityInterface[]):Promise<void> {
        if (!this.model)
            return

        await this.model.setData(_.cloneDeep(items))
    }

    setContext(ctx: any) {
        this.context = ctx

        if (this.model && (this.model.setContext instanceof Function)) {
            this.model.setContext(ctx)
        }
    }

    setScript(script: string) {
        this.script = script
    }

    emitHandler(event: string, ...args) {
        switch (event) {
            case 'update': this.emit('update', ...args); break;
            case 'item-inserted': this.emit('item-inserted', ...args);break;
            case 'item-updated': this.emit('item-updated', ...args);break;
            case 'item-removed': this.emit('item-removed', ...args);break;
        }
    }

    async init() {
        await this.setScript(this.script)
        await this.compile()

        if (this.model && this.model.init instanceof Function)
            await this.model.init()
    }

    async compile() {

        let func = await compileScript(this.script, 'ctx', 'emit')
        this.model = null

        try {
            this.model = func.exec(this.context, this._emitHandler)
        } catch (e) {
            this.model = null
            throw e
        }
    }

    async getById(id: string | number): Promise<EntityInterface | undefined> {
        if (!this.model || !(this.model.getById instanceof Function))
            return;

        return await this.model.getById(id)
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getMany(options: GetDataManyOptions): Promise<GetManyResponse> {
        if (!this.model || !(this.model.getMany instanceof Function))
            return {data: [], count: 0};

        return  _.cloneDeep(await this.model.getMany(options))
    }

    async insert(id: string, value: any, parentId?: string): Promise<any> {
        if (!this.model || !(this.model.insert instanceof Function))
            return;

        return await this.model.insert(id, value, parentId)
    }

    async removeById(id: string): Promise<boolean> {
        if (!this.model)
            return;

        return await this.model.removeById(id)
    }

    async updateById(id: string, value: object): Promise<EntityInterface> {
        if (!this.model)
            return;

        return await this.model.updateById(id, value)
    }

    async setValue(id: string, field: string, value: any) {
        if (!this.model)
            return;

        await this.model.setValue(id, field, value)
    }
}

export class FieldDataSource extends EventEmitter implements DataSourceInterface {
    alias: string;
    cached: boolean;
    fields: FieldInterface[];
    isTree: boolean;
    keyField: string;
    readonly: boolean;
    source: DataSourceSource.field;
    type: DataSourceType = DataSourceType.data;
    _data: EntityInterface[] = []

    private fieldByAlias: Map<string, FieldInterface>
    private config: DataSourceConfigInterface

    constructor(config: DataSourceConfigInterface) {
        super()
        this.alias = config.alias
        this.fieldByAlias = new Map()
        this.keyField = config.keyField
        this.config = config
        this.readonly = !!config.readonly ? config.readonly : false
        this.fields = []

        config.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        if (this.fieldByAlias.size > 0)
            this.fields = [...this.fieldByAlias.values()]
    }

    get data(): EntityInterface[] {
        return this._data
    }

    async getById(id: string | number): Promise<EntityInterface | undefined> {
        for(let i in this.data) {
            if (this._data[i].id === id) {
                return this._data[i]
            }
        }
        return undefined;
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getMany(options?: GetDataManyOptions): Promise<GetManyResponse> {
        return {
            data: _.cloneDeep(this._data),
            count: this._data.length
        }
    }

    async insert(id: string, value: any): Promise<EntityInterface> {
        value.id = id
        this._data.push(value)
        this.emit('item-inserted', {
            data: value
        })
        this.emit('update', this._data)

        return value
    }

    async removeById(id: string): Promise<boolean> {
        for(let i in this._data) {
            let item = this._data[i]
            if (item.id === id) {
                this._data.splice(Number(i), 1);
                this.emit('item-removed', {
                    data: item
                })
                this.emit('update', this._data)
                return true;
            }
        }

        return false
    }

    async updateById(id: string, value: object): Promise<EntityInterface> {
        for(let i in this._data) {
            let item = this._data[i]
            if (item.id === id) {
                this._data[i] = value
                this.emit('item-updated', {
                    data: value
                })
                this.emit('update', this._data)
                return item;
            }
        }
        return undefined
    }

    async setValue(id: string, field: string, value: any): Promise<void> {
        let item = await this.getById(id)
        if (item) {
            item[field]  = value
            await this.updateById(id, item)
        }
    }

    async setData(items: EntityInterface[]):Promise<void> {
        this._data = !items ? [] : _.cloneDeep(items)
    }
}

export class PageConfigDataSource extends DataSource {
    constructor(server: ServerInterface) {
        super({
            type: DataSourceType.config,
            alias: 'page',
            keyField: 'alias',
            cached: true,
            title: 'Pages',
            fields: [{
                title: 'Title',
                alias: 'title',
                type: "string",
                required: true
            },
                {
                    title: 'Path',
                    alias: 'path',
                    type: "string",
                    required: true
                },
                {
                    title: 'Alias',
                    alias: 'alias',
                    type: "string",
                    required: true
                },
                {
                    title: 'DataSets',
                    alias: 'dataSets',
                    type: 'list',
                    listOf: "dataset",
                    keyProp: 'alias',
                    displayProp: 'alias',
                },
                {
                    title: 'Elements',
                    alias: 'elements',
                    type: 'list',
                    listOf: 'element',
                    keyProp: 'name',
                    displayProp: 'name',
                    hidden: false
                },{
                    title: "onOpen",
                    alias: "onOpen",
                    type: 'handler'
                }]
        }, server);
    }
}

export class MenuConfigDataSource extends DataSource {
    constructor(server: ServerInterface) {
        super({
            type: DataSourceType.config,
            alias: 'menu',
            title: 'Menus',
            keyField: 'alias',
            cached: true,
            fields: [
            {
                title: 'Title',
                alias: 'title',
                type: "string",
                required: true
            },
            {
                title: 'Path',
                alias: 'path',
                type: "string",
                required: true
            },
            {
                title: 'Icon',
                alias: 'icon',
                type: "string",
                required: false
            },
            {
                title: "Items",
                alias: "items",
                type: "list",
                required: false
            }
        ]}, server);
    }
}

export class ReportConfigDataSource extends DataSource {
    constructor(server: ServerInterface) {
        super({
            type: DataSourceType.config,
            alias: 'report',
            title: 'Reports',
            cached: true,
            fields: [
                {
                    title: 'Alias',
                    alias: 'alias',
                    type: "string",
                    required: true
                },
                {
                    title: 'Title',
                    alias: 'title',
                    type: "string",
                    required: true
                },
                {
                    title: 'Template',
                    alias: 'template',
                    type: "string",
                    required: true
                },
                {
                    title: 'Script',
                    alias: 'script',
                    type: "string",
                    required: true
                },
                {
                    title: 'Test context',
                    alias: 'testContext',
                    type: "string",
                    required: true
                },
                {
                    title: 'Pages',
                    alias: 'pages',
                    type: "link",
                    required: true,
                    isMultiple: true,
                    datasource: 'page',
                    displayProp: 'title',
                    keyProp: "alias"
                },
            ]}, server);
    }
}

export class DataSourceConfigDataSource extends DataSource {
    constructor(server: ServerInterface) {
        super({
            type: DataSourceType.config,
            alias: 'datasource',
            keyField: 'alias',
            title: 'Data sources',
            cached: true,
            fields: [
                {
                    title: 'Title',
                    alias: 'title',
                    type: "string",
                    required: true,
                    default: "New data source"
                },
                {
                    title: 'Type',
                    alias: 'type',
                    type: "string",
                    required: true,
                    default: 'data'
                },
                {
                    title: 'Alias',
                    alias: 'alias',
                    type: "string",
                    required: false,
                    default: 'data-source'
                },
                {
                    title: "Fields",
                    alias: "fields",
                    type: "list",
                    required: true
                },
                {
                    title: "Source",
                    alias: "source",
                    type: "enum",
                    required: true,
                    default: 'internal',
                    values: [{
                        key: 'internal',
                        title: "Internal"
                    },{
                        key: 'field',
                        title: "Field"
                    },{
                        key: 'custom',
                        title: "Custom"
                    },{
                        key: 'restapi',
                        title: "REST API"
                    },{
                        key: 'sql',
                        title: "SQL"
                    }]
                },
                {
                    title: "Context",
                    alias: "context",
                    type: "text",
                    required: false,
                    default: "{}"
                },
                {
                    title: "Script",
                    alias: "script",
                    type: "text",
                    required: false,
                    default: "{}"
                },{
                    title: "Readonly",
                    alias: "readonly",
                    type: "bool",
                    required: false,
                    default: false
                }, {
                    title: "Is tree",
                    alias: "isTree",
                    type: "bool",
                    required: false,
                    default: false
                },{
                    title: "Event handlers",
                    alias: "eventHandlers",
                    type: "handler",
                    required: false,
                    default: [],
                    isMultiple: true
                }
            ]}, server);
    }
}

export class FunctionsConfigDataSource extends DataSource {
    constructor(server: ServerInterface) {
        super({
            type: DataSourceType.config,
            alias: 'function',
            keyField: 'alias',
            cached: true,
            title: 'Functions',
            fields: [
                {
                    title: 'Title',
                    alias: 'title',
                    type: "string",
                    required: true
                },
                {
                    title: 'Alias',
                    alias: 'alias',
                    type: "string",
                    required: true
                },
                {
                    title: "Script",
                    alias: "script",
                    type: "text",
                    required: true
                },
                {
                    title: "Context",
                    alias: "context",
                    type: "text",
                    required: true,
                    default: "{}"
                }
            ]}, server);
    }
}