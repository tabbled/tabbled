export interface ReportDto {
    id?: number
    title: string
    parameters: ReportParameterDto[]
    description?: string,
    templateType: 'html' | 'excel'
    postprocessing?: string
    html?: string
    xlsx?: string
    datasets: DatasetDto[]
    pages: string[]
    permissions: {
        view: {
            type: "all" | "nobody" | 'roles',
            roles: string[]
        }
    }
    pageSettings: {
        size?: string
        layout?: 'portrait' | 'landscape'
        margin?: 'default' | 'custom'
        marginTop?: string
        marginLeft?: string
        marginRight?: string
        marginBottom?: string
    },
}

export class ReportParameterValuesDto {
    key: string
    label: string
}

export interface ReportParameterDto {
    alias: string
    type?: 'date' | 'time' | 'datetime' | 'bool' | 'number' | 'string' | 'select' | 'enum'
    title: string
    isMultiple?: boolean
    description?: string,
    defaultValue?: string | number | any[]
    datasourceReference?: string
    datasourceRefDisplayField?: string
    values?: ReportParameterValuesDto[]
    linkedDatasourceIsTree?: boolean
}

export interface DatasetDto {
    alias: string
    datasource?: string
    fields?: DatasetFieldDto[]
    filterBy?: string
    filters?: any[],
    groupBy?: string[]
    sort: DatasetSortDto[]
}

export interface DatasetFieldDto {
    alias: string,
    type: 'data' | 'calc'
    format?: string
    aggFunc?: 'none' | 'sum' | 'avg' | 'min' | 'max'
}

export interface DatasetSortDto {
    alias: string
    order: 'asc' | 'desc'
}

