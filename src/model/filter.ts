import {ref} from "vue";
import {DataSourceInterface} from "./datasource";

export declare type StandardQueryOperator = '<' | '<=' | '==' | '!=' | '>' | '>=' | 'exists' | '!exists' | 'between' | '!between' | 'like' | '!like' | 'matches' | '!matches' | 'in' | '!in' | 'has' | '!has' | 'contains' | '!contains' | 'any' | 'empty' | '!empty';

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
    private groupById: Map<string, FilterItemInterface[]> = new Map()

    get filters() {
        return this._filters;
    }
    get dataSource() {
        return this._dataSource
    }

    private _filters: Array<FilterItemInterface> = []

    setFilter(id, filter: FilterItemInterface | null, updateFilter: boolean = true) {
        if (!filter) {
            this.filtersById.delete(id)
        } else {
            this.filtersById.set(id, filter)
        }

        if (updateFilter)
            this.updateFilters()
    }

    setGroup(id, filters: Array<FilterItemInterface>) {
        if (!filters) {
            this.groupById.delete(id)
        } else {
            this.groupById.set(id, filters)
        }

        this.updateFilters()
    }

    clear() {
        this.filtersById.clear()
        this._filters = []
    }

    private updateFilters() {
        let filters = [...this.filtersById.values()]

        this.groupById.forEach(gr => {
            filters = filters.concat(gr)
        })

        this._filters = filters
    }

    restoreState(filters) {
        this._filters = filters
    }

    backupState() {
        return this._filters
    }
}


export function useFilters(dataSource: DataSourceInterface) {
    return ref<Filters>(new Filters(dataSource))
}