export type ColumnType = 'field' | 'calc' | 'lookup'

export interface Column {
    id: string
    type: ColumnType
    title: string
    field?: string // required if type = field
    minWidth?: number
    width?: number
    sortable?: boolean,
    format?: string
}