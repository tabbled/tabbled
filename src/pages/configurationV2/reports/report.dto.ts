import {FieldDataType} from "../../../model/field";

export interface ReportDto {
    id: string
    alias: string
    title: string
    parameters: ReportParameterDto[]
    description: string,
    templateType: 'html' | 'excel',
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

export interface ReportParameterDto {
    alias: string
    type?: FieldDataType
    title: string
    isMultiple?: boolean
    description?: string,
    defaultValue?: string | number
}

export interface DatasetDto {
    alias: string
    datasource?: string
    fields?: string[]
    filterBy?: string
    filters?: any[]
}