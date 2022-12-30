import {DataSourceInterface, EntityInterface} from "./datasource";
import {FieldInterface} from "./field";
import {ColumnConfigInterface, Column} from "./column";
import _ from 'lodash'

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

    private _currentRow: number | null = null

    get currentRow(): number | null {
        return this._currentRow;
    };

    set currentRow(id: number | null) {
        console.log(id)

        if (this.autoCommit &&
            this._isChanged &&
            this._currentRow !== null &&
            this._currentRow != id) {
            this.commit()
        }
        this._currentRow = id
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

    insertRow(row: number): boolean {
        this.data.splice(row, 0, { id: 0});
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

    commit() {
        console.log('commit')
        this._isChanged = false;
    }

    rollback() {

    }
}