import {ref} from "vue";
import {DataSourceInterface} from "./datasource";

export declare type StandardQueryOperator = '<' | '<=' | '==' | '!=' | '>' | '>=' | 'exists' | '!exists' | 'between' | '!between' | 'like' | '!like' | 'matches' | '!matches' | 'in' | '!in' | 'has' | '!has' | 'contains' | '!contains' | 'any' | 'empty';
export interface FilterItemInterface {
    key: string,
    op: StandardQueryOperator,
    compare?: any
}

export class Filters {
    constructor(dataSource: DataSourceInterface) {
        this._dataSource = dataSource
    }
    private readonly _dataSource: DataSourceInterface
    private filtersById: Map<string, FilterItemInterface> = new Map()

    get filters() {
        return this._filters;
    }
    get dataSource() {
        return this._dataSource
    }

    private _filters: Array<FilterItemInterface> = []

    setFilter(id, filter: FilterItemInterface | null) {
        if (!filter) {
            this.filtersById.delete(id)
        } else {
            this.filtersById.set(id, filter)
        }

        this._filters = [...this.filtersById.values()]
    }

    clear() {
        this.filtersById.clear()
        this._filters = []
    }
}


export function useFilters(dataSource: DataSourceInterface) {
    return ref<Filters>(new Filters(dataSource))
}