import {Field, FieldConfigInterface, FieldInterface} from "./field";
import _ from 'lodash'
import { useDatabase } from '../services/database.service'
import {EventEmitter} from "events";
import {DataItemInterface, useSyncService} from "../services/sync.service";

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
    sql = 'sql'
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

export interface DataSourceInterface extends EventEmitter{
    readonly: boolean,
    alias: string,
    isTree?: boolean,
    fields: FieldInterface[],
    cached: boolean,
    keyField: string,
    type: DataSourceType
    source: DataSourceSource

    /**
     * Get all data store from the data source
     * @returns {EntityInterface[]} all data from data source
     */
    getAll(): Promise<EntityInterface[]>

    /**
     * Get data with filters and pagination
     * @returns {EntityInterface[]} data from data source
     */
    getMany(filter: FilterItemInterface[], take?: number, skip?: number): Promise<EntityInterface[]>
    getManyRaw(filter: FilterItemInterface[], take?: number, skip?: number): Promise<DataItemInterface[]>

    /**
     * Return entity data by row
     * @param id entity id
     * @returns entity if exists or null if not exists
     */
    getById(id: string | number) : Promise<EntityInterface | undefined>
    getByKey(key: string | number) : Promise<EntityInterface | undefined>

    //onCellChange?: (row: number, newValue: any, oldValue?: any) => void;
    onChange?: (id: string, newValue: any) => void;

    insert(id: string, value: any): Promise<void>
    updateById(id: string, value: object): Promise<void>
    removeById(id: string): Promise<void>

    // Sync Service use this method when got data from server
    setRemoteChanges?(data: DataItemInterface[]): Promise<boolean>

    getFieldByAlias(alias: string): FieldInterface | undefined
}

export interface DataSourceConfigInterface {
    fields: FieldConfigInterface[],
    type: DataSourceType,
    title?: string,
    alias: string,
    readonly?: boolean,
    keyField: string,
    isTree?: boolean,
    source?: DataSourceSource
}

export class DataSource extends EventEmitter implements DataSourceInterface {
    constructor(config: DataSourceConfigInterface) {
        super()
        this.fieldByAlias = new Map()
        this.alias = config.alias
        this.keyField = config.keyField
        this.type = config.type
        this.config = config
        this.source = DataSourceSource.internal
        this.fields = []




        config.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        if (this.fieldByAlias.size > 0)
            this.fields = [...this.fieldByAlias.values()]

    }

    private fieldByAlias: Map<string, FieldInterface>
    private config: DataSourceConfigInterface

    alias: string;
    fields: FieldInterface[];
    keyField: string;
    cached = true;
    readonly = false
    type: DataSourceType
    source: DataSourceSource

    async getAll(): Promise<EntityInterface[]> {
        if (!db.database)
            return []

        let snapshot= await db.database.query(`/${this.type}/${this.alias}`)
            .filter('deletedAt', '==', null)
            .take(1000)
            .get()

        let arr = []
        let vals = snapshot.getValues();
        for (const i in vals) {
            arr.push( _.cloneDeep(vals[i].data))
        }

        return arr
    }

    async getMany(filter: FilterItemInterface[], take: number = 100, skip: number = 0): Promise<EntityInterface[]> {
        let items = await this.getManyRaw(filter, take, skip)
        return items.map(item => item.data)
    }

    async getManyRaw(filter: FilterItemInterface[], take: number = 100, skip: number = 0): Promise<DataItemInterface[]> {
        if (!db.database)
            return []

        let ref = await db.database.query(`/${this.type}/${this.alias}`)

        for(const i in filter) {
            let item = filter[i]
            ref = ref.filter(item.key, item.op, item.compare)
        }

        let vals = await ref.take(take).skip(skip).get()
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
        try {
            let item = await this.getByIdRaw(id)
            return item.data;
        } catch (e) {
            throw e
        }
    }

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

    async insert(id: string, value: any): Promise<void> {
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
        } catch (e) {
            throw e
        }
    }

    async updateById(id: string, value: object): Promise<void> {
        if (!db.database)
            return

        try {
            let old = await this.getByIdRaw(id);

            if (!old) {
                console.error(`Item with id ${id} in "${this.alias}" not found`)
                return;
            }

            let item:DataItemInterface = _.cloneDeep(old)

            item.updatedAt = new Date();
            item.updatedBy = db.userId;
            item.version = old.version + 1;
            item.rev = ''
            item.data =  _.cloneDeep(value)
            await db.database.ref(`/${this.type}/${this.alias}/${id}`).update(item)
            await syncService.push(this.type, [item]);
        } catch (e) {
            console.error(e)
        }
    }

    async removeById(id: string): Promise<void> {
        if (!db.database)
            return

        let item = await this.getByIdRaw(id);

        if (!item) {
            console.error(`Item with id ${id} in "${this.alias}" not found`)
            return;
        }

        item.deletedAt = new Date();
        item.deletedBy = db.userId
        item.rev = '';

        await db.database.ref(`/${this.type}/${this.alias}/${item.id}`).set(item)
        await syncService.push(this.type, [item]);
    }

    async setRemoteChanges(data: DataItemInterface[]):Promise<boolean> {
        if (!db.database)
            return false;

        for(const i in data) {
            let item = data[i]

            let current_item = await this.getByIdRaw(item.id)
            await db.database.ref(`/${this.type}/${this.alias}/${item.id}`).update(item)

            if (!current_item) {
                this.emit('inserted', item.data)
            } else {
                if (current_item.version === item.version && current_item.rev !== '' && current_item.rev === item.rev) {
                    console.warn(`Item ${item.id} received from remote has the same version ${item.version}`)
                    return true
                } else if (current_item.version !== item.version) {
                    this.emit('updated', item.data)
                }

                if (item.deletedAt && !current_item.deletedAt) {
                    this.emit('removed', item.data)
                }
            }
        }
        return true
    }
}

export class PageConfigDataSource extends DataSource {
    constructor() {
        super({
            type: DataSourceType.config,
            alias: 'page',
            keyField: 'alias',
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
        });
    }
}

export class MenuConfigDataSource extends DataSource {
    constructor() {
        super({
            type: DataSourceType.config,
            alias: 'menu',
            keyField: 'alias',
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
        ]});
    }
}

export class DataSourceConfigDataSource extends DataSource {
    constructor() {
        super({
            type: DataSourceType.config,
            alias: 'datasource',
            keyField: 'alias',
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
                        key: 'custom',
                        title: "Custom"
                    },{
                        key: 'restapi',
                        title: "REST API"
                    },{
                        key: 'sql',
                        title: "SQL"
                    }]
                }
            ]});
    }
}

export class FunctionsConfigDataSource extends DataSource {
    constructor() {
        super({
            type: DataSourceType.config,
            alias: 'function',
            keyField: 'alias',
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
            ]});
    }
}