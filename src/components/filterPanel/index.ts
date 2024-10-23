import {StandardQueryOperator} from "../dataset";


export interface FilterPanelItemInterface {
    id: string
    colSpan: number
    field: string
    operation: StandardQueryOperator
    title: string
}