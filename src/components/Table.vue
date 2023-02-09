<template>
    <el-table
            border
            :data="props.dataSet ? props.dataSet.data : []"
            :fit="true"
            row-key="id"
            highlight-current-row
            :header-cell-class-name="getHeaderCellClass"
            :header-row-class-name="getHeaderClass"
            :cell-class-name="getCellClass"
            :row-class-name="getRowClass"
            @mouseleave="onMouseLeave"
            @current-change="currentRowChanged"
            @selection-change="selectionChange"
            @row-click="onTableRowClick"
            @rowDblclick="onTableRowDblClick"

    >
        <el-table-column v-if="isRowSelectable" type="selection" width="30" />
        <el-table-column v-for="element in columns"
                         :sortable="element.sortable ? 'custom' : false"
                         :key="element.field"
                         :label="element.title"
                         :width="element.width"
                         :prop="element.field"

        >
            <template #default="scope">
                <Input ref="editEl" v-if="editingCell && editingCell.row === scope.$index && editingCell.col === scope.column.no"
                       :model-value="getCellData(scope)"
                       @update:model-value="(val) => onCellInput(scope, val)"
                       @keydown="inputKeyDown"
                       @focusout="() => cellFocusedOut()"/>
                <div v-else @click="() => handleCellClick(scope)" class="table-cell-text" >
                    {{getCellData(scope)}}
                </div>

            </template>
            <template #header="scope">
                {{getHeaderTitle(scope)}}
            </template>
        </el-table-column>

<!--        <el-table-column fixed="right" width="40" :resizable="false" class-name="adv-column">-->
<!--            <template #header>-->
<!--                <el-button text style="border-radius: 0; padding: 0; margin: 0 ">-->
<!--                    <span class="iconify " data-icon="mdi:cog" style="width: 18px; height: 18px; " />-->
<!--                </el-button>-->
<!--            </template>-->
<!--            <template #default>-->
<!--            </template>-->
<!--        </el-table-column>-->
    </el-table>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from 'vue'
import {Column} from "../model/column";
import {DataSet} from "../model/dataset";
import Input from "./table/Input.vue"
import {CompiledFunc, compileScript} from "../services/compiler";
import {EventHandlerConfigInterface} from "../model/field";


interface Props {
    dataSet: DataSet,
    columns: Column[];
    isRowSelectable?: boolean,
    isInlineEditing?: boolean
    context: any,
    onRowClick?: EventHandlerConfigInterface
    onRowDoubleClick?: EventHandlerConfigInterface
}
const props = withDefaults(defineProps<Props>(), {
    isRowSelectable: true,
    isInlineEditing: true
})
let actions = ref({
    onRowDoubleClick: null,
    onRowClick: null
})

//let data = ref<Array<EntityInterface>>([])
//let columns = ref<Array<Column>>([])
let editingCell = ref<{row: number, col: number} | null>(null)
let editEl = ref(null)
//let data = ref<Array<EntityInterface>>([])

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

async function compileAction(action) {
    if (!action || (action.type === 'script' && (!action.script || action.script === '')))
        return null

    try {
        return await compileScript(action.script, 'ctx')
    } catch (e) {
        console.error(e)
        return null
    }
}

async function execAction(action: CompiledFunc, additionalContext?: object) {
    try {
        let ctx = Object.assign(props.context, additionalContext)
        action.exec(ctx)
    } catch (e) {
        console.error(`Execution error in action`)
        console.error(e);
    }
}

function selectionChange(rows: Array<any>) {
    let ids: string[] = []
    rows.forEach(row => {
        ids.push(row.id)
    })
    props.dataSet.selectedIds = ids;
}

function onTableRowClick(row) {
    if (actions.value.onRowClick) {
        execAction(actions.value.onRowClick, { row: row })
    }
}

function onTableRowDblClick(row) {
    if (actions.value.onRowDoubleClick) {
        execAction(actions.value.onRowDoubleClick, { row: row })
    }
}

function currentRowChanged(row: any) {
    if (!row) {
        props.dataSet.setCurrentId(null)
        return;
    }

    if (props.dataSet)
        props.dataSet.setCurrentId(row['id'])
}

function onCellInput(scope: any, value: any) {
    let fieldAlias = scope.column.property;
    props.dataSet.updateDataRow(scope.$index, fieldAlias, value)
}

function handleCellClick(scope:any) {
    if (props.isInlineEditing)
        editingCell.value = {
            row: scope.$index,
            col: scope.cellIndex
        }
}

function inputKeyDown(e:KeyboardEvent) {
    if (e.code === 'Enter') {
        cellFocusedOut()
    }
}

function cellFocusedOut() {
    editingCell.value = null

    if (props.dataSet)
        props.dataSet.commit();
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
    let col = props.columns[idx];
    if (!col)
        return "error"

    return col.title
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
    if (props.dataSet && !editingCell.value && props.dataSet.autoCommit && props.dataSet.isChanged()) {
        props.dataSet.commit()
    }
}

function getHeaderClass() {
    return "table-header"
}

async function init() {

    actions.value.onRowDoubleClick = await compileAction(props.onRowDoubleClick)
    actions.value.onRowClick = await compileAction(props.onRowClick)

    //columns.value = []


    if (props.dataSet) {
        //columns.value = props.dataSet.columns
        //data.value = props.dataSet.data

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
        padding: 4px 8px 4px 8px;
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
