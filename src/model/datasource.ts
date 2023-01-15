import {Field, FieldConfigInterface, FieldInterface} from "./field";
import _ from 'lodash'
import { useDatabase } from '../services/database.service'
import {EventEmitter} from "events";
import {DataItemInterface, useSyncService} from "../services/sync.service";

const db = useDatabase()
const syncService = useSyncService()

export enum DataSourceType {
    tableField = 'tableField',
    config = 'config',
    data = 'data'
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
}

export class DataSource extends EventEmitter implements DataSourceInterface {
    constructor(config: DataSourceConfigInterface) {
        super()
        this.keyField = config.keyField;
        this.isTree = !!config.isTree;
        this.fieldByAlias = new Map()
        this.alias = config.alias;
        this.readonly = !!config.readonly;


        config.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        this.fields = [...this.fieldByAlias.values()]
    }

    private data: EntityInterface[] = [{
        _id: "1",
        name: "aaaa",
        color: "red"
    },{
        _id: "2",
        name: "bbbb",
        color: "black"
    },{
        _id: "3",
        name: "ccc",
        color: "blue"
    }]

    private fieldByAlias: Map<string, FieldInterface>

    alias: string;
    fields: FieldInterface[];
    keyField: string;
    isTree?: boolean;
    cached: boolean = true;
    readonly: boolean = false;
    type: DataSourceType = DataSourceType.data

    async getAll(): Promise<EntityInterface[]> {
        return this.data;
    }

    async getMany(filter: FilterItemInterface[], take: number = 100, skip: number = 0): Promise<EntityInterface[]> {
        return []
    }

    async getManyRaw(filter: FilterItemInterface[], take?: number, skip?: number): Promise<DataItemInterface[]> {
        return []
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getById(id: string | number): Promise<EntityInterface | undefined> {
        return undefined;
    }

    async removeById(id: string): Promise<void> {

    }

    async insert(id: string, value: any): Promise<void> {

    }

    async updateById(id: number | string, value: object): Promise<void> {

    }
}

export class ConfigDataSource extends EventEmitter implements DataSourceInterface {
    constructor(alias: string, keyField: string, fields: FieldConfigInterface[]) {
        super()
        this.fieldByAlias = new Map()
        this.alias = alias
        this.keyField = keyField

        fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
        this.fields = [...this.fieldByAlias.values()]
    }

    private fieldByAlias: Map<string, FieldInterface>

    alias: string;
    fields: FieldInterface[];
    keyField: string;
    cached = true;
    readonly = false
    type: DataSourceType = DataSourceType.config
    onChange?: (id: string, newValue: any) => void;

    async getAll(): Promise<EntityInterface[]> {
        if (!db.database)
            return []

        let snapshot= await db.database.query(`/config/${this.alias}`)
            .filter('deletedAt', '==', null)
            .take(100)
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

        let ref = await db.database.query(`/config/${this.alias}`)

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

    async getByIdRaw(id: string): Promise<DataItemInterface | undefined> {
        if (!db.database)
            return undefined

        try {
            let snap = await db.database.ref(`/config/${this.alias}/${id}`).get()
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

            await db.database.ref(`/config/${this.alias}/${id}`).update(item)
            await syncService.push(DataSourceType.config, [item]);
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
                console.error(`Item with id ${id} in "${this.alias}" config not found`)
                return;
            }

            let item:DataItemInterface = _.cloneDeep(old)

            item.updatedAt = new Date();
            item.updatedBy = db.userId;
            item.version = old.version + 1;
            item.rev = ''
            item.data =  _.cloneDeep(value)
            await db.database.ref(`/config/${this.alias}/${id}`).update(item)
            await syncService.push(DataSourceType.config, [item]);
        } catch (e) {
            console.error(e)
        }
    }

    async removeById(id: string): Promise<void> {
        if (!db.database)
            return

        let item = await this.getByIdRaw(id);

        if (!item) {
            console.error(`Item with id ${id} in "${this.alias}" config not found`)
            return;
        }

        item.deletedAt = new Date();
        item.deletedBy = db.userId
        item.rev = '';

        await db.database.ref(`/config/${this.alias}/${item.id}`).set(item)
        await syncService.push(DataSourceType.config, [item]);
    }

    async setRemoteChanges(data: DataItemInterface[]):Promise<boolean> {
        if (!db.database)
            return false;

        for(const i in data) {
            let item = data[i]

            let current_item = await this.getByIdRaw(item.id)
            await db.database.ref(`/config/${this.alias}/${item.id}`).update(item)

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

export class PageConfigDataSource extends ConfigDataSource {

    constructor() {
        super('page', 'alias', [
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
                title: 'Component',
                alias: 'component',
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
                title: 'Layout',
                alias: 'layout',
                type: "text",
                required: true
            }
        ]);
    }
}

export class MenuConfigDataSource extends ConfigDataSource {
    constructor() {
        super('menu', 'alias', [
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
        ]);
    }
}

export class DataSourceConfigDataSource extends ConfigDataSource {
    constructor() {
        super('datasource', 'alias', [
            {
                title: 'Title',
                alias: 'title',
                type: "string",
                required: true
            },
            {
                title: 'Type',
                alias: 'type',
                type: "string",
                required: true
            },
            {
                title: 'Alias',
                alias: 'alias',
                type: "string",
                required: false
            },
            {
                title: "Fields",
                alias: "fields",
                type: "list",
                required: true
            }
        ]);
    }
}