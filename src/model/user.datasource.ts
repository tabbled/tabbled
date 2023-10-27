import {ServerInterface} from "../services/socketio.service";
import {DataSourceService} from "../services/datasource.service";
import {
    DataSourceInterface,
    DataSourceSource,
    DataSourceType,
    EntityInterface,
    GetDataManyOptions,
    GetManyResponse
} from "./datasource";
import {Field, FieldInterface} from "./field";
import {EventEmitter} from "events";

export class UsersConfigDataSource extends EventEmitter implements DataSourceInterface {
    aggFields: string[];
    alias: string = 'users';
    cached: boolean = false;
    isAggregator: boolean = false
    isTree: boolean = false
    keyField: string = 'id'
    keyFields: string[];
    readonly: boolean = false
    source: DataSourceSource = DataSourceSource.internal;
    type: DataSourceType = DataSourceType.config;
    fields: FieldInterface[] = [{
        title: 'First name',
        alias: 'firstname',
        type: "string",
        required: true
    },{
        title: 'Last name',
        alias: 'lastname',
        type: "string",
        required: true
    },{
        title: 'Username',
        alias: 'username',
        type: "string",
        required: true
    },{
        title: 'Active',
        alias: 'active',
        type: "bool",
        required: true
    }];

    readonly server: ServerInterface = null
    protected service: DataSourceService
    private fieldByAlias: Map<string, FieldInterface>

    constructor(server: ServerInterface, service: DataSourceService) {
        super()
        this.server = server
        this.service = service
        this.fieldByAlias = new Map()

        this.fields.forEach(conf => {
            this.fieldByAlias.set(conf.alias, new Field(conf))
        })
    }

    getById(id: string | number): Promise<EntityInterface | undefined> {
        return Promise.resolve(undefined);
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        return this.fieldByAlias.get(alias)
    }

    async getMany(options?: GetDataManyOptions): Promise<GetManyResponse> {
        const data = await this.server.emit(`${'users/getMany'}`, options)

        return {
            data: data.items,
            totals: data.totals,
            count: data.count
        }
    }

    insert(id: string, value: any, parentId?: string, route?: string[]): Promise<EntityInterface> {
        return Promise.resolve(undefined);
    }

    removeById(id: string, route?: string[]): Promise<boolean> {
        return Promise.resolve(false);
    }

    updateById(id: string, value: object): Promise<EntityInterface> {
        return Promise.resolve(undefined);
    }

}