import {DataSourceInterface, EntityInterface} from "./datasource";
import {FieldInterface} from "./field";
import {ColumnConfigInterface, Column} from "./column";

export interface DataSetConfigInterface {
    alias: string,
    columns: ColumnConfigInterface[],
    dataSource: string
}

export class DataSet {

    constructor(alias: string, dataSource: DataSourceInterface, columns: ColumnConfigInterface[] | undefined) {
        this.dataSource = dataSource;
        this.alias = alias;

        if (columns)
            this.setColumns(columns)
    }

    readonly alias: string;
    readonly dataSource: DataSourceInterface | undefined
    readonly columns: Column[] = []
    data: EntityInterface[] = []

    selectedRows: number[] = []
    currentRow: number | null = null



    setColumns(columns: ColumnConfigInterface[]) {
        if (!this.dataSource) {
            console.warn(`DataSource doesn't provide`)
            return;
        }

        columns.forEach(colConfig => {
            let field = this.dataSource?.getFieldByAlias(colConfig.field);

            if (field) {
                let column = new Column(colConfig, field)
                this.columns.push(column)
            } else
                console.warn(`Field "${colConfig.field}" not found in data source ${this.dataSource?.alias}`)
        })
    }

    load() {
        console.log('Load dataSet ', this.alias)
        if (!this.dataSource) {
            console.warn(`Can't load, dataSource doesn't set`)
            return;
        }

        this.data = this.dataSource.getAll()
    }

    getByRow(row: number) : EntityInterface {
        return this.data[row]
    }

    getColumnByAlias(alias: string): FieldInterface | undefined {
        if (!this.dataSource)
            return undefined;

        return this.dataSource.getFieldByAlias(alias);
    }

    insertRow(row: number): boolean {
        this.data.splice(row, 0, {id: 0})
        return true
    }

    updateRow(row: number, entity: EntityInterface) {
        this.data.splice(row, 1, entity);
    }

    updateDataRow(row: number, field: string, cellData: any): boolean {
        let ent = this.data[row]

        if (ent) {
            ent[field] = cellData
            this.data.splice(row, 1, ent)
            return true;
        }

        return false;
    }

    removeRow(row: number) : boolean {
        this.data.splice(row, 1)
        return false
    }

    commit() {

    }

    rollback() {

    }
}