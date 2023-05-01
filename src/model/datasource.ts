import {Field, FieldConfigInterface, FieldInterface} from "./field";
import _ from 'lodash'
import { useDatabase } from '../services/database.service'
import {DataItemInterface, useSyncService} from "../services/sync.service";
import {compileScript} from "../services/compiler";
import {EventEmitter} from "events";
import {ServerInterface} from "../services/socketio.service";

const db = useDatabase()
const syncService = useSyncService()

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

export declare type StandardQueryOperator = '<' | '<=' | '==' | '!=' | '>' | '>=' | 'exists' | '!exists' | 'between' | '!between' | 'like' | '!like' | 'matches' | '!matches' | 'in' | '!in' | 'has' | '!has' | 'contains' | '!contains';
export interface FilterItemInterface {
    key: string,
    op: StandardQueryOperator,
    compare?: any
}

export interface GetDataManyOptions {
    filter?: FilterItemInterface[]
    take?: number
    skip?: number
    sort?: {
        field: string
        ask: boolean
    }

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
     * @deprecated
     * Get all data store from the data source
     * @returns {EntityInterface[]} all data from data source
     */
    getAll(): Promise<EntityInterface[]>

    /**
     * Get data with filters and pagination
     * @returns {EntityInterface[]} data from data source
     */
    getMany(options?: GetDataManyOptions): Promise<EntityInterface[]>
    getManyRaw(options?: GetDataManyOptions): Promise<DataItemInterface[]>

    /**
     * Return entity data by row
     * @param id entity id
     * @returns entity if exists or null if not exists
     */
    getById(id: string | number) : Promise<EntityInterface | undefined>
    //getByKey(key: string | number) : Promise<EntityInterface | undefined>

    //onCellChange?: (row: number, newValue: any, oldValue?: any) => void;
    onChange?: (id: string, newValue: any) => void;

    insert(id: string, value: any, parentId?: string): Promise<EntityInterface>
    updateById(id: string, value: object): Promise<EntityInterface>
    removeById(id: string): Promise<boolean>

    getChildren(id: string) : Promise<EntityInterface | undefined>

    // Sync Service use this method when got data from server
    setRemoteChanges?(item: DataItemInterface[]): Promise<boolean>

    // Set items
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


    async getChildren(id: string) : Promise<EntityInterface | undefined> {
        return undefined
    }

    async getAll(): Promise<EntityInterface[]> {
        return await this.getMany()
    }

    async getMany(options: GetDataManyOptions = {}): Promise<EntityInterface[]> {
        if (this.cached) {
            let items = await this.getManyRaw(options)
            console.log(items)
            return items.map(item => item.data)
        } else {
            let dt = new Date().getMilliseconds()
            console.log("getMany from server, options: ", options)
            let res = await this.server.emit('dataSources/data/getMany', {
                alias: this.alias,
                options: options
            })
            console.log(`${this.alias}, got items: ${res.length}; timing, ms: ${new Date().getMilliseconds() - dt}`)
            return res
        }
    }

    async getManyRaw(options: GetDataManyOptions = {}): Promise<DataItemInterface[]> {
        if (!db.database)
            return []

        let ref = await db.database.query(`/${this.type}/${this.alias}`)


        let filter = this.defaultFilters(options.filter)
        for(const i in filter) {
            let item = filter[i]

            // Replace sql like pattern to AceBase pattern
            if (item.op ==='like' || item.op === '!like') {
                item.compare = item.compare.replaceAll('%', '*')
            }

            ref = ref.filter(item.key, item.op, item.compare)
        }
        if (options.take) ref.take(options.take)
        if (options.skip) ref.skip(options.skip)
        if (options.sort) ref.sort(options.sort.field, options.sort.ask)

        let vals = await ref.get()
        let values = vals.getValues()

        let arr = []
        for (const i in values) {
            arr.push( _.cloneDeep(values[i]))
        }

        return arr
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getById(id: string): Promise<EntityInterface | undefined> {
        if (!id)
            return undefined

        if (this.cached) {
            try {
                let item = await this.getByIdRaw(id)
                return item?.data;
            } catch (e) {
                throw e
            }
        } else {
            let dt = new Date().getMilliseconds()
            //console.log(this.alias, " getById from server")
            let res = await this.server.emit('dataSources/data/getById', {
                alias: this.alias,
                id: id
            })
            console.log(this.alias, " gotById from server; timing, ms: ", new Date().getMilliseconds() - dt)
            return res
        }
    }

    // Only needed for pages service,
    // TODO remove that method
    async getByKey(key: string | number) : Promise<EntityInterface | undefined> {
        if (!db.database)
            return undefined

        try {
            let snap = await db.database.query(`/${this.type}/${this.alias}`)
                .filter(`data/${this.keyField}`, '==', key)
                .take(1)
                .get()

            let vals = snap.getValues()

            return vals.length > 0 ? vals[0].data : undefined
        } catch (e) {
            throw e
        }
    }

    async getByIdRaw(id: string): Promise<DataItemInterface | undefined> {
        if (!db.database)
            return undefined

        try {
            let snap = await db.database.ref(`/${this.type}/${this.alias}/${id}`).get()
            return snap.val()
        } catch (e) {
            throw e
        }
    }

    async insert(id: string, value: any): Promise<EntityInterface> {
        if (this.cached) {
            if (!db.database)
                return
            try {
                let item:DataItemInterface = {
                    id: id,
                    accountId: db.accountId,
                    createdAt: new Date(),
                    createdBy: db.userId,
                    updatedAt: new Date(),
                    updatedBy: db.userId,
                    version: 1,
                    alias: this.alias,
                    rev: '',
                    data:  _.cloneDeep(value)
                }

                await db.database.ref(`/${this.type}/${this.alias}/${id}`).update(item)
                await syncService.push(this.type, [item]);
                this.emit('update')
                this.emit('item-inserted', id, value)
                return value
            } catch (e) {
                throw e
            }
        } else {
            let dt = new Date().getMilliseconds()
            console.log(this.alias, " insert")

            let res = await this.server.emit('dataSources/data/insert', {
                alias: this.alias,
                id: id,
                value: value
            })
            console.log(this.alias, " inserted; timing, ms: ", new Date().getMilliseconds() - dt)

            this.emit('item-inserted', id, res.data)
            return res
        }

    }

    async updateById(id: string, value: object): Promise<EntityInterface> {
        if (this.cached) {
            if (!db.database)
                return

            try {
                let old = await this.getByIdRaw(id);

                if (!old) {
                    console.error(`Item with id ${id} in "${this.alias}" not found`)
                    return;
                }

                let item: DataItemInterface = _.cloneDeep(old)

                item.updatedAt = new Date();
                item.updatedBy = db.userId;
                item.version = old.version + 1;
                item.rev = ''
                item.data = _.cloneDeep(value)
                await db.database.ref(`/${this.type}/${this.alias}/${id}`).update(item)
                await syncService.push(this.type, [item]);
                this.emit('updated')
                this.emit('item-updated', id, item.data)
            } catch (e) {
                console.log(value)
                throw e
            }
        } else {
            let dt = new Date().getMilliseconds()
            console.log(this.alias, " insert")

            let res = await this.server.emit('dataSources/data/updateById', {
                alias: this.alias,
                id: id,
                value: value
            })
            console.log(this.alias, " updated; timing, ms: ", new Date().getMilliseconds() - dt)

            this.emit('item-updated', id, res.data)
            return res
        }
    }

    async removeById(id: string): Promise<boolean> {
        if (this.cached) {
            if (!db.database)
                return false

            let item = await this.getByIdRaw(id);

            if (!item) {
                console.error(`Item with id ${id} in "${this.alias}" not found`)
                return false;
            }

            item.deletedAt = new Date();
            item.deletedBy = db.userId
            item.rev = '';

            await db.database.ref(`/${this.type}/${this.alias}/${item.id}`).set(item)
            await syncService.push(this.type, [item]);
            this.emit('updated')
            this.emit('item-removed', id, item.data)
            return true;
        } else {
            let dt = new Date().getMilliseconds()
            let res = await this.server.emit('dataSources/data/removeById', {
                alias: this.alias,
                id: id
            })
            console.log(this.alias, "removed; timing, ms: ", new Date().getMilliseconds() - dt)

            this.emit('item-removed', id, res.data)
            return true
        }
    }

    async setRemoteChanges(items: DataItemInterface[]):Promise<boolean> {
        if (!db.database)
            return false;

        console.log(`DataSource ${this.alias} got remote changes, count: ${items.length}`)

        for(const i in items) {
            const item = items[i]
            let current_item = await this.getByIdRaw(item.id)

            await db.database.ref(`/${this.type}/${this.alias}/${item.id}`).update(item)


            if (!current_item) {
                this.emit('item-inserted', item.id, item.data)
            } else {
                this.emit('item-updated', item.id, item.data)

                if (item.deletedAt && !current_item.deletedAt) {
                    this.emit('item-removed', item.id, item.data)
                }
            }
        }
        this.emit('update')
        return true
    }

    async setValue(id: string, field: string, value: any) {
        if (this.cached) {
            if (!db.database)
                return

            let item = await this.getById(id)
            if (!item)
                return

            item[field] = value
            await this.updateById(id, item)
        } else {
            let dt = new Date().getMilliseconds()
            let res = await this.server.emit('dataSources/data/setValue', {
                alias: this.alias,
                id: id,
                field: field,
                value: value
            })
            console.log(this.alias, "updated; timing, ms: ", new Date().getMilliseconds() - dt)

            console.log(res)

            this.emit('item-updated', id, res.data)
        }

    }

    defaultFilters(filter: FilterItemInterface[]): FilterItemInterface[] {
        let f = filter || [];
        let deleted = f.find((item) => item && item.key === 'deletedAt')
        if (!deleted)
            f.push({
                key: 'deletedAt',
                op: "==",
                compare: null
            })
        return f
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

    async getChildren(id: string) : Promise<EntityInterface | undefined> {
        if (!this.model)
            return

        return await this.model.getChildren(id)
    }

    async getAll(): Promise<EntityInterface[]> {
        if (!this.model)
            return []

        let data = await this.model.getAll()
        return _.cloneDeep(data)
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
        //console.log('emitHandler', event, ...args)

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

        if (this.model)
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

    async getMany(options: GetDataManyOptions): Promise<EntityInterface[]> {
        if (!this.model || !(this.model.getMany instanceof Function))
            return [];

        return await this.model.getMany(options)
    }

    async getManyRaw(options: GetDataManyOptions): Promise<DataItemInterface[]> {
        if (!this.model || !(this.model.getMany instanceof Function))
            return [];

        return await this.model.getManyRaw(options)
    }

    async insert(id: string, value: any, parentId?: string): Promise<any> {
        if (!this.model || !(this.model.insert instanceof Function))
            return;

        return await this.model.insert(id, value, parentId)
    }

    async removeById(id: string): Promise<boolean> {
        if (!this.model)
            return;

        console.log('remove', id)

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

    async getChildren(id: string) : Promise<EntityInterface | undefined> {
        return undefined
    }

    getAll(): Promise<EntityInterface[]> {
        return Promise.resolve([]);
    }

    getById(id: string | number): Promise<EntityInterface | undefined> {
        return Promise.resolve(undefined);
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    getMany(options: GetDataManyOptions): Promise<EntityInterface[]> {
        return Promise.resolve([]);
    }

    getManyRaw(options: GetDataManyOptions): Promise<DataItemInterface[]> {
        return Promise.resolve([]);
    }

    insert(id: string, value: any): Promise<EntityInterface> {
        return Promise.resolve(undefined);
    }

    removeById(id: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    updateById(id: string, value: object): Promise<EntityInterface> {
        return Promise.resolve(undefined);
    }

    setValue(id: string, field: string, value: any): Promise<void> {
        return
    }
}

export class PageConfigDataSource extends DataSource {
    constructor(server: ServerInterface) {
        super({
            type: DataSourceType.config,
            alias: 'page',
            keyField: 'alias',
            cached: true,
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

export class DataSourceConfigDataSource extends DataSource {
    constructor(server: ServerInterface) {
        super({
            type: DataSourceType.config,
            alias: 'datasource',
            keyField: 'alias',
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
                    title: "Test context",
                    alias: "context",
                    type: "text",
                    required: true,
                    default: "{}"
                }
            ]}, server);
    }
}