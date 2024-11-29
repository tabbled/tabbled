import {FieldDataType} from "../../../model/field";

export interface ReportDto {
    id?: number
    alias: string
    title: string
    parameters: ReportParameterDto[]
    description?: string,
    templateType: 'html' | 'excel'
    script: string
    html?: string
    xlsx?: string
    datasets: DatasetDto[]
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
    type?: FieldDataType
    title: string
    isMultiple?: boolean
    description?: string,
    defaultValue?: string | number
    datasourceReference?: string
    datasourceRefDisplayField?: string
    values?: ReportParameterValuesDto[]
    linkedDatasourceIsTree?: boolean
}

export interface DatasetDto {
    alias: string
    datasource?: string
    fields?: string[]
    filterBy?: string
    filters?: any[]
}