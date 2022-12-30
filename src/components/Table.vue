<template>
    <el-table
            border
            :data="data"
            :fit="true"
            :row-key="dataSet.keyField"
            highlight-current-row
            :header-cell-class-name="getHeaderCellClass"
            :header-row-class-name="getHeaderClass"
            :cell-class-name="getCellClass"
            :row-class-name="getRowClass"
            @mouseleave="onMouseLeave"

    >
        <el-table-column v-if="isRowSelectable" type="selection" width="30" />
        <el-table-column v-for="element in columns"
                         :sortable="element.sortable ? 'custom' : false"
                         :key="element.field.alias"
                         :label="element.title"
                         :width="element.width"
                         :prop="element.field.alias"

        >
            <template #default="scope">
                <Input ref="editEl" v-if="editingCell && editingCell.row === scope.$index && editingCell.col === scope.column.no"
                       :model-value="getCellData(scope)"
                       @update:model-value="(val) => onCellInput(scope, val)"
                       @focusout="(e) => cellFocusedOut(e, scope)"/>
                <div v-else @click="(e) => handleCellClick(scope, e)" class="table-cell-text" >
                    {{getCellData(scope)}}
                </div>

            </template>
            <template #header="scope">
                {{getHeaderTitle(scope)}}
            </template>
        </el-table-column>

        <el-table-column fixed="right" width="40" :resizable="false" class-name="adv-column">
            <template #header>
                <el-button text style="border-radius: 0; padding: 0; margin: 0 ">
                    <span class="iconify " data-icon="mdi:cog" style="width: 18px; height: 18px; " />
                </el-button>
            </template>
            <template #default>
            </template>
        </el-table-column>
    </el-table>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from 'vue'
import {Column} from "../model/column";
import {DataSet} from "../model/dataset";
import {EntityInterface} from "../model/datasource";
import Input from "./table/Input.vue"


interface Props {
    dataSet: DataSet,
    isRowSelectable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    isRowSelectable: true
})

let data = ref<Array<EntityInterface>>([])
let columns = ref<Array<Column>>([])
let editingCell = ref<{row: number, col: number} | null>(null)
let editEl = ref(null)

watch(() => props,
    async () => {
        init();
    },
    {
        deep: true
    })

onMounted(() => {
    init();
});

function onCellInput(scope: any, value: any) {
    let fieldAlias = scope.column.property;
    props.dataSet.updateDataRow(scope.$index, fieldAlias, value)
    //console.log(scope, fieldAlias, value)
}

function handleCellClick(scope:any) {
    editingCell.value = {
        row: scope.$index,
        col: scope.cellIndex
    }
    props.dataSet.currentRow = scope.$index
}

function cellFocusedOut() {
    editingCell.value = null
}

let getCellClass = (scope: any) => {
    if (editingCell.value &&
        scope.rowIndex === editingCell.value.row &&
        scope.columnIndex === editingCell.value.col) {
        return "table-cell-edit"
    }

    return "table-cell"
}

let getHeaderCellClass = (column: any) => {
    let classes: string = 'table-cell-header';
    if (column.column.order === '' || !column.column.order)
        classes += ` hidden-sort-wrapper`
    return  classes
}

let getHeaderTitle = (scope: any) => {
    let idx = props.isRowSelectable ? scope.$index -1 : scope.$index
    return columns.value[idx].title
}

let getCellData = (scope: any) => {
    if (!props.dataSet)
        return;

    const entity: object | undefined = props.dataSet.getByRow(scope.$index);

    if (!entity)
        return ''

    return entity[scope.column.property] ? entity[scope.column.property] : ''
}

function getRowClass() {
    return "table-row"
}

function onMouseLeave() {
    if (!editingCell.value && props.dataSet.autoCommit && props.dataSet.isChanged()) {
        props.dataSet.commit()
    }
}

function getHeaderClass() {
    return "table-header"
}

function init() {
    data.value = []
    columns.value = []


    if (props.dataSet) {
        columns.value = props.dataSet.columns
        data.value = props.dataSet.data
    } else
        console.warn(`DataSet parameter for Table component not set`)

}


</script>

<style lang="scss">

.hidden-sort-wrapper {
    .cell {
        .caret-wrapper {
            visibility: hidden !important;
        }
    }
}

.table-header {
    .el-table__cell {
        padding: 4px;
    }

    .cell {
        padding-left: 8px;
        padding-right: 8px;
    }
}

.table-row {
    height: 34px;
    text-overflow: ellipsis !important;
}

.table-cell-header {
    .cell {
        white-space: nowrap !important;
        font-weight: 500 !important;
    }
}

.adv-column {
    .cell {
        white-space: nowrap;
        text-overflow: clip;
    }
}

.table-cell {
    .cell {
        padding-left: 8px !important;
        padding-right: 8px !important;
        padding-bottom: 4px;
        padding-top: 4px;
        white-space: nowrap;

    }
}

.table-cell-text {
    min-height: 22px;
    text-overflow: ellipsis;
}

.el-table .el-table__cell {
    padding: 0 !important;

}

.table-cell:hover {
    box-shadow:0 0 0 1px var(--el-color-primary-light-5) inset;
}

.table-cell-edit {
    box-shadow:0 0 0 1px var(--el-color-primary) inset;
    .cell {
        padding: 0 !important;
        margin: 0 !important;
    }

    .el-table__cell{
        padding: 1px;
        margin: 1px;
    }
}

.adv-column-cell:focus {
    background: red;
}

</style>
