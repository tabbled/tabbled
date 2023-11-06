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
        title: 'Password',
        alias: 'password',
        type: "password",
        required: true
    },{
        title: 'Active',
        alias: 'active',
        type: "bool",
        required: true,
        default: true
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

    async getById(id: number): Promise<EntityInterface | undefined> {
        if (!id)
            return null

        return await this.server.emit(`users/getById`, {
            id: id
        })

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

    async insert(id: string, value: any): Promise<EntityInterface> {
        console.log(value)
        let res = await this.server.emit(`users/insert`, {
            value: value
        })

        console.log(res)

        this.emit('item-inserted', {
            data: res,
            route: []
        })

        return res
    }

    async removeById(id: string): Promise<boolean> {
        let res = await this.server.emit(`users/removeById`, {
            id: id
        })

        this.emit('item-removed', {
            data: res,
            route: []
        })

        return res
    }

    async updateById(id: string, value: object): Promise<EntityInterface> {
        let res = await this.server.emit(`users/updateById`, {
            id: id,
            value: value
        })

        this.emit('item-updated', {
            data: res,
            route: []
        })

        return res
    }

    hasPermission(action: string, userPermissions: any) {
        return userPermissions.admin
    }
}