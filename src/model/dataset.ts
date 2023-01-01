import {DataSourceInterface, EntityInterface} from "./datasource";
import {FieldInterface} from "./field";
import {ColumnConfigInterface, Column} from "./column";
import _ from 'lodash'
import { FlakeId } from '../flake-id'
let idgen = new FlakeId()

export interface DataSetConfigInterface {
    alias: string,
    columns: ColumnConfigInterface[],
    dataSource: string
}

export class DataSet {

    constructor(alias: string, dataSource: DataSourceInterface, columns: ColumnConfigInterface[] | undefined) {
        this.dataSource = dataSource;
        this.alias = alias;
        this.keyField = this.dataSource.keyField

        if (columns)
            this.setColumns(columns)
    }

    readonly alias: string;
    readonly dataSource: DataSourceInterface;
    readonly columns: Column[] = [];
    readonly keyField: string;
    autoCommit: boolean = true;
    data: EntityInterface[] = [];

    private _isChanged: boolean = false;
    isChanged():boolean {
        return this._isChanged;
    }

    selectedIds: number[] = []
    private _currentId: number | string | null = null

    currentId(): number | string | null {
        return this._currentId;
    }

    setCurrentId(id: number | string | null) {
        console.log(id)
        if (this.autoCommit &&
            this._isChanged &&
            this._currentId !== null &&
            this._currentId !== id) {
            this.commit()
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

    load() {
        console.log('Load dataSet ', this.alias)
        this._isChanged = false;
        this.data =  this.dataSource.getAll()
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

        console.log('insert', row, this._currentId, r)

        let id = await idgen.generateId()

        this.data.splice(r ? r : 0, 0, { _id: id.toString()});
        this._isChanged = true;
        return true
    }

    updateRow(row: number, entity: EntityInterface) {
        this.data.splice(row, 1, entity);
        this._isChanged = true;
    }

    updateDataRow(row: number, field: string, cellData: any): boolean {
        let ent = this.data[row]

        if (ent) {
            ent[field] = cellData
            this.data.splice(row, 1, ent)
            this._isChanged = true;
            return true;
        }

        return false;
    }

    removeRow(row: number) : boolean {
        this.data.splice(row, 1)
        this._isChanged = true;
        return false
    }

    removeByCurrentId() : boolean {
        if (!this._currentId)
            return false;

        let row = this.getRowById(this._currentId)

        if (!row)
            return false;

        this.data.splice(row, 1)
        this._isChanged = true;
        return true
    }

    commit() {
        console.log('commit')
        this._isChanged = false;

        console.log(JSON.stringify(this.data))
    }

    rollback() {

    }

    private getRowById(id: number | string): number | undefined {
        for(let i in this.data) {
            if (this.data[i][this.keyField] === id) {
                return Number(i)
            }
        }
        return undefined
    }
}