<template>
    <el-table
            ref="table"
            border
            :data="data"
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
                       :field="getField(element.field)"
                       @update:model-value="(val) => onCellInput(scope, val)"
                       @keydown="inputKeyDown"
                       :style="getInputCellStyle()"
                       :context="getRowContext(scope)"
                />
                <div v-else @click="() => handleCellClick(scope)" class="table-cell-text">
                    <Cell :model-value="getCellValue(scope)"
                          :field="getField(element.field)"
                          :updateKey='updateKey'
                    />
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
import {CompiledFunc, compileScript} from "../services/compiler";
import {EventHandlerConfigInterface} from "../model/field";
import {useSyncService} from "../services/sync.service";
import {useDataSourceService} from "../services/datasource.service";
import Cell from "./table/Cell.vue";
import _ from "lodash";

interface Props {
    id: string,
    dataSet: UnwrapRef<DataSet>,
    field?: string,
    fieldDataSet?: UnwrapRef<DataSet>,
    columns: ColumnConfigInterface[];
    readonly ?: boolean
    context: any,
    onRowClick?: EventHandlerConfigInterface
    onRowDoubleClick?: EventHandlerConfigInterface
}
const props = withDefaults(defineProps<Props>(), {
    readonly: false
})
let actions = ref({
    onRowDoubleClick: null,
    onRowClick: null
})
const emit = defineEmits(['rowDblClick', 'rowClick'])
let updateKey = ref(0)

interface CellRef {row: number, col: number}

let _columns = ref<ColumnConfigInterface[]>([])
let editingCell = ref<CellRef | null>(null)
let editEl = ref(null)
let table = ref(null)
let dsService = useDataSourceService()

let data = ref<Array<any>>([])

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
    if (props.fieldDataSet) {
        props.fieldDataSet.removeListener('open', getFieldData)
        props.fieldDataSet.removeListener('update', getFieldData)
    }


    props.dataSet.removeListener('update', setDataToFieldDataSet)
})


function getInputCellStyle() {
    let style:any = {}
    //display: inline-flex; width:
    if (props.dataSet.dataSource.isTree && editingCell.value.col === 1) {
        style.display = 'inline-flex'
        style.width = 'calc(100% - 40px)'
    }
    return style
}

function getRowContext(scope) {
    let ctx = props.context ? _.cloneDeep(props.context) : {}
    ctx.row = scope.row
    return ctx
}

async function loadData(row, treeNode, resolve) {
    let data = await props.dataSet.getChildren(row.id)
    resolve(data)
}

function setCurrentCell(cell: CellRef) {

    if (editingCell.value !== cell) {
        editingCell.value = cell
    }

    editingCell.value = cell
}

function getField(field: string) {
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
    props.dataSet.setValue(scope.row.id, fieldAlias, value)
}

async function getFieldReadonly(field:string, scope: any):Promise<boolean> {
    let fGetReadonly = await props.dataSet.dataSource.getFieldByAlias(field).getReadonlyFunc()
    if (fGetReadonly) {
        return await fGetReadonly.exec(getRowContext(scope))
    }
    return false
}

async function handleCellClick(scope:any) {
    console.log(props.dataSet.dataSource.readonly, props.readonly, (await getFieldReadonly(scope.column.property, scope)))
    if (!props.dataSet.dataSource.readonly && !props.readonly && !(await getFieldReadonly(scope.column.property, scope)))
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

    return await props.dataSet.getValue(scope.row.id, scope.column.property)
}

function getCellValue(scope: any) {
    //console.log(scope)
    if (scope.$index < 0)
        return undefined

    //console.log(scope.row.id)

    return props.dataSet.getValue(scope.row.id, scope.column.property)
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



    if (props.dataSet) {
        //data.value = props.dataSet.data

        props.dataSet.on('update', () => {
            updateKey.value += 1
            data.value = props.dataSet.data
        })
    }


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

        console.log('emits')
        props.fieldDataSet.on('open', getFieldData)
        props.fieldDataSet.on('update', getFieldData)
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
    console.log('update')
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
        align-items: center;
    }
}

.table-cell-text {
    min-height: 22px;
    text-overflow: ellipsis;
    width: 100%;
    white-space: nowrap;
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
