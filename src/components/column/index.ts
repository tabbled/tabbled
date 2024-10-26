export type ColumnType = 'field' | 'calc' | 'lookup'

export interface Column {
    id: string
    type: ColumnType
    title: string
    field?: string // required if type = field
    minWidth?: number
    width?: number
    sortable?: boolean
    searchable?: boolean
    format?: string
    wordwrap?: boolean,
    aggregationFunc?: 'none' | 'sum' | 'avg' | 'min' | 'max'
}