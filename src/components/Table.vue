<template>
    <el-table
            ref="table"
            border
            :data="props.dataSet ? props.dataSet.data : []"
            :fit="true"
            row-key="id"
            highlight-current-row
            :header-cell-class-name="getHeaderCellClass"
            :header-row-class-name="getHeaderClass"
            :cell-class-name="getCellClass"
            :row-class-name="getRowClass"
            @current-change="currentRowChanged"
            @selection-change="selectionChange"
            @row-click="onTableRowClick"
            @rowDblclick="onTableRowDblClick"
            @header-dragend="headerResized"
            lazy
            :load="loadData"
    >
        <el-table-column type="selection" width="30" />
        <el-table-column v-for="element in _columns.filter(item => item.visible === undefined || item.visible)"
                         :sortable="element.sortable ? 'custom' : false"
                         :key="element.id"
                         :label="element.title"
                         :width="element.width"
                         :prop="element.field"
        >
            <template #default="scope">
                <Input ref="editEl" v-if="editingCell && editingCell.row === scope.$index && editingCell.col === scope.column.no"
                       :model-value="getCellData(scope)"
                       :field="getFieldConfig(element.field)"
                       @update:model-value="(val) => onCellInput(scope, val)"
                       @keydown="inputKeyDown"
                       style="display: inline-flex; width: calc(100% - 24px)"
                />
                <div v-else @click="() => handleCellClick(scope)" class="table-cell-text">
                    <LinkCell v-if="getFieldConfig(element.field) && (getFieldConfig(element.field).type === 'link' || getFieldConfig(element.field).type === 'enum')"
                              :field="getFieldConfig(element.field)"
                              :model-value="getCellData(scope)"

                    />
                    <Cell v-else
                          :model-value="dataSet.getValue(scope.column.property, scope.$index)"
                          :field="getFieldConfig(element.field)" />
                </div>

            </template>
            <template #header="scope">
                {{getHeaderTitle(scope)}}
            </template>
        </el-table-column>

    </el-table>
</template>

<script setup lang="ts">

import {onMounted, onUnmounted, ref, UnwrapRef, watch} from 'vue'
import {ColumnConfigInterface} from "../model/column";
import {DataSet} from "../model/dataset";
import Input from "./table/Input.vue"
import LinkCell from "./table/LinkCell.vue";
import {CompiledFunc, compileScript} from "../services/compiler";
import {EventHandlerConfigInterface} from "../model/field";
import {useSyncService} from "../services/sync.service";
import {useDataSourceService} from "../services/datasource.service";
import Cell from "./table/Cell.vue";

interface Props {
    id: string,
    dataSet: UnwrapRef<DataSet>,
    field?: string,
    fieldDataSet?: UnwrapRef<DataSet>,
    columns: ColumnConfigInterface[];
    isReadonly?: boolean
    context: any,
    onRowClick?: EventHandlerConfigInterface
    onRowDoubleClick?: EventHandlerConfigInterface
}
const props = withDefaults(defineProps<Props>(), {
    isReadonly: true
})
let actions = ref({
    onRowDoubleClick: null,
    onRowClick: null
})
const emit = defineEmits(['rowDblClick', 'rowClick'])

interface CellRef {row: number, col: number}

let _columns = ref<ColumnConfigInterface[]>([])
let editingCell = ref<CellRef | null>(null)
let editEl = ref(null)
let table = ref(null)
let dsService = useDataSourceService()

let sync = useSyncService()
const configAlias = `config/table-config-${props.id}`


watch(() => props.columns,
    async () => {
        await initColumns()
    },
    {
        deep: true
    })

watch(() => props.dataSet,
    async () => {
        await init()
    },
    {
        deep: false
    })

onMounted(async () => {
    await initColumns()
    await init();
});

onUnmounted(() => {
    if (props.fieldDataSet)
        props.fieldDataSet.removeListener('open', getFieldData)

    props.dataSet.removeListener('update', setDataToFieldDataSet)
})

async function loadData(row, treeNode, resolve) {

    console.log('loadData', row, treeNode)
    resolve(await props.dataSet.dataSource.getChildren(row.id))
}

function save() {
    if (props.dataSet && props.dataSet.autoCommit && props.dataSet.isChanged()) {
        props.dataSet.commit()
    }
}

function setCurrentCell(cell: CellRef) {

    if (editingCell.value !== cell) {
        editingCell.value = cell
    }

    editingCell.value = cell
    save()
}

function getFieldConfig(field: string) {
    if (!props.dataSet)
        return undefined;

    let f = props.dataSet.dataSource.getFieldByAlias(field)

    if (!f)
        console.warn(`Field "${field}" doesn't exists in data source "${props.dataSet.dataSource.alias}"`)

    return f
}

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
    emit('rowClick', { id: row.id })
    if (actions.value.onRowClick) {
        execAction(actions.value.onRowClick, { row: row })
    }
}

function onTableRowDblClick(row) {
    if (editingCell.value)
        return;

    emit('rowDblClick', { id: row.id })

    if (actions.value.onRowDoubleClick) {
        execAction(actions.value.onRowDoubleClick, { row: row })
    }
}

function headerResized(newWidth, oldWidth, column) {

    for(let i in _columns.value) {
        let col = _columns.value[i]
        if (col.id === column.rawColumnKey) {
            col.width = newWidth
        }
    }

    let widths = {}
    for(let i in _columns.value) {
        let col = _columns.value[i]
        widths[col.id] = col.width
    }

    sync.setValue(configAlias, widths);
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
    if (!props.isReadonly)
        setCurrentCell({
            row: scope.$index,
            col: scope.cellIndex
        })
}

function inputKeyDown(e:KeyboardEvent) {
    if (e.code === 'Enter') {
        cellFocusedOut()
    }
}

function cellFocusedOut() {
    setCurrentCell(null)
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
    let idx = scope.$index -1
    let col = props.columns[idx];
    if (!col)
        return "error"

    return col.title
}

let getCellData = async (scope: any) => {
    if (!props.dataSet)
        return;

    return await props.dataSet.getValue(scope.column.property, scope.$index)
}

function getRowClass() {
    return "table-row"
}

function getHeaderClass() {
    return "table-header"
}

async function initColumns() {
    _columns.value = props.columns
    let widths = await sync.getValue(configAlias)

    for(let i in _columns.value) {
        const col = _columns.value[i]


        if (widths && widths[col.id]) {
            col.width = widths[col.id]
        }
    }
}

async function init() {
    setCurrentCell(null)

    actions.value.onRowDoubleClick = await compileAction(props.onRowDoubleClick)
    actions.value.onRowClick = await compileAction(props.onRowClick)

    // If props.fieldDataSet is set than it is a field table we should get/set data from props.fieldDataSet
    if(props.fieldDataSet) {

        if (!props.field) {
            console.error(`Field for field table not set`)
            return
        }

        let field = props.fieldDataSet.dataSource.getFieldByAlias(props.field)

        if (!field) {
            console.error(`DataSource "${props.fieldDataSet.dataSource.alias}" of field for field "${props.field}" table doesn't exist`)
            return
        }

        props.fieldDataSet.on('open', getFieldData)
        props.dataSet.on('update', setDataToFieldDataSet)

        if (props.fieldDataSet.isOpen && props.fieldDataSet.current) {
            getFieldData()
        }
    }
}

function getFieldData(){
    console.log('getFieldData')
    if (!props.fieldDataSet.current || !props.fieldDataSet.current[props.field]) {
        props.dataSet.data = []
        return;
    }

    props.dataSet.data = props.fieldDataSet.current[props.field]
}

function setDataToFieldDataSet() {
    if (!props.fieldDataSet.current) {
        return
    }

    props.fieldDataSet.update(props.field, props.dataSet.data)
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
        padding: 4px 8px 4px 8px !important;
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
        display: flex;
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
    width: 100%;
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
