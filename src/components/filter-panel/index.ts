import {StandardQueryOperator} from "../dataset";


export interface FilterPanelItemInterface {
    id: string
    field?: string
    operation?: StandardQueryOperator
    title: string,
    format?: string,
    width?: string,
    isMultiple?: boolean
    widget?: 'select' | 'buttons'
}