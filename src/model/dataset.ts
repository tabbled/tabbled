import {DataSourceInterface, EntityInterface} from "./datasource";
import {FieldInterface} from "./field";

export class DataSet {
    dataSource: DataSourceInterface | undefined

    selectedRows: number[] = []
    currentRow: number | null = null

    data: EntityInterface[] = []

    load() {
        if (!this.dataSource) {
            console.warn(`Can't load, dataSource doesn't set`)
            return;
        }

        this.data = this.dataSource.getAll()
    }

    getByRow(row: number) : EntityInterface {
        return this.data[row]
    }

    getFieldByAlias(alias: string): FieldInterface | undefined {
        if (!this.dataSource)
            return undefined;

        return this.dataSource.getFieldByAlias(alias);
    }

    insertRow(row: number): boolean {
        this.data.splice(row, 0, {id: 0})
        return true
    }

    updateRow(row: number, entity: EntityInterface) {
        this.data[row] = entity;
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