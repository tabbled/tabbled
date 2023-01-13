import {DataSourceInterface, EntityInterface} from "./datasource";
import {FieldInterface} from "./field";
import {ColumnConfigInterface, Column} from "./column";
import {ref, UnwrapRef} from "vue";
import _ from 'lodash'
import { FlakeId } from '../flake-id'
let flakeId = new FlakeId()

export interface DataSetConfigInterface {
    alias: string,
    columns: ColumnConfigInterface[],
    dataSource: string
}

interface RowChange {
    old: any,
    new: any,
    type: 'insert' | 'update' | 'remove',
    at: Date
}

export class DataSet {

    constructor(alias: string, dataSource: DataSourceInterface, columns: ColumnConfigInterface[] | undefined) {
        this.dataSource = dataSource;
        this.alias = alias;
        this.keyField = this.dataSource.keyField

        if (columns)
            this.setColumns(columns)


        this.dataSource.on('changed', async (value) => {
            // @ts-ignore
            // I don't know, but we access the ref<> in emit callback then ref need to get with .value
            let data = this.data.value
            for(let i in data) {
                let item = data[i]
                if (item.id === value.id) {
                    data[i] = value
                }
            }
        })
    }

    readonly alias: string;
    readonly dataSource: DataSourceInterface;
    readonly columns: Column[] = [];
    readonly keyField: string;
    autoCommit: boolean = true;
    private _data = ref<Array<EntityInterface>>([]);



    private _changesById: Map<string, RowChange> = new Map<string, RowChange>()

    isChanged():boolean {
        return this._changesById.size > 0
    }

    get data(): UnwrapRef<Array<EntityInterface>> {
        return this._data.value
    }

    set data(value) {
        this._data.value = value
    }

    selectedIds: string[] = []
    private _currentId: string | null = null

    currentId(): number | string | null {
        return this._currentId;
    }

    async setCurrentId(id: string | null) {
        if (this.autoCommit &&
            this.isChanged() &&
            this._currentId !== null &&
            this._currentId !== id) {
            await this.commit()
        }
        this._currentId = id
    }

    setColumns(columns: ColumnConfigInterface[]) {
        columns.forEach(colConfig => {
            let field = _.cloneDeep(this.dataSource.getFieldByAlias(colConfig.field));

            if (field) {
                let column = new Column(colConfig, field)
                this.columns.push(column)
            } else
                console.warn(`Field "${colConfig.field}" not found in data source ${this.dataSource.alias}`)
        })
    }

    async load() {
        this.data =  await this.dataSource.getAll();
        this._changesById.clear();
    }


    getByRow(row: number) : EntityInterface {
        return this.data[row]
    }

    getColumnByAlias(alias: string): FieldInterface | undefined {
        return this.dataSource.getFieldByAlias(alias);
    }

    async insertRow(row?: number): Promise<boolean> {
        let r:number | undefined;
        if (!row && this._currentId) {
            r = this.getRowById(this._currentId)
            if (!r) r = 0
        } else
            r = row;

        let id = (await flakeId.generateId()).toString()
        let item = {
            id: id.toString()
        }

        this.data.splice(r ? r : 0, 0, item);

        this._changesById.set(id, {
            new: item,
            old: undefined,
            at: new Date(),
            type: 'insert'
        })

        return true
    }

    updateDataRow(row: number, field: string, cellData: any): boolean {

        let ent = this.data[row]
        if (!ent)
            return false;

        let oldEnt = _.cloneDeep(ent)
        let change = this._changesById.get(ent.id);

         ent[field] = cellData

        if (change) {
            change.new = _.cloneDeep(ent)
            change.at = new Date()
        } else {
            change = {
                new: _.cloneDeep(ent),
                old: oldEnt,
                type: 'update',
                at: new Date()
            }
        }

        this.data.splice(row, 1, ent)
        this._changesById.set(ent.id, change)

        return true;
    }

    removeRow(row: number) : boolean {

        let id = this.data[row].id;
        let change = this._changesById.get(id);

        if (change) {
            if (change.type === 'insert') {
                this._changesById.delete(id)
            } else {
                change.new = null;
                change.at = new Date()
            }
        } else {
            change = {
                new: null,
                old: _.cloneDeep(this.data[row]),
                type: "remove",
                at: new Date()
            }
        }

        this._changesById.set(id, change)

        this.data.splice(row, 1)

        return false
    }

    removeByCurrentId() : boolean {
        if (!this._currentId)
            return false;

        let row = this.getRowById(this._currentId)

        if (!row)
            return false;

        this.data.splice(row, 1)
        return true
    }

    removeBySelectedId() : boolean {

        if (!this.selectedIds.length)
            return false;

        this.selectedIds.forEach((id) => {
            let row = this.getRowById(id)
            if (row !== undefined) {
                this.removeRow(row)
            }
        })
        return true
    }

    async commit() {
        if (!this._changesById.size)
            return;

        console.log('commit')
        let changes = [...this._changesById.values()]
        this._changesById.clear()
        for (let i in changes) {
            let item:any = changes[i]
            switch (item.type) {
                case "insert": await this.dataSource.insert(item.new.id, item.new); break;
                case "update": await this.dataSource.updateById(item.new.id, item.new); break;
                case "remove": await this.dataSource.removeById(item.old.id); break;
                default: console.warn("Unknown type of operation in DataSet Commit")
            }
        }
    }

    rollback() {

    }

    private getRowById(id: string): number | undefined {
        for (let i in this.data) {
            if (this.data[i].id === id) {
                return Number(i)
            }
        }
        return undefined
    }
}