<template>
    <div v-if="dataSource && actionButtonsVisible" style="padding-bottom: 16px; display: flex;">
        <el-button v-if="(actions.onAdd || (!actions.onAdd && !isTree) || onClickAdd) " type="primary" @click="add" size="small">
            {{t('add')}}
        </el-button>
        <el-dropdown v-else
                     split-button
                     type="primary"
                     @click="add"
                     size="small"
                     style="margin-right: 8px"
        >
            Add
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="addSibling">Add sibling</el-dropdown-item>
                    <el-dropdown-item @click="add">Add child</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-button v-if="actions.onEdit" @click="edit" size="small">
            {{t('edit')}}
        </el-button>
        <el-button @click="remove" size="small">
            {{t('delete')}}
        </el-button>
    </div>
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
                    <Cell :model-value="getCellData(scope)"
                          :field="getField(element.field)"
                          :context="getRowContext(scope)"
                    />
                </div>

            </template>
            <template #header="scope">
                {{getHeaderTitle(scope)}}
            </template>
        </el-table-column>

        <template #append >
            <el-button v-if="dataSource && canLoadNext" style="margin: 16px" @click="loadNext()">
                Load next entities
            </el-button>
        </template>
    </el-table>
</template>

<script setup lang="ts">

import {onMounted, onUnmounted, ref, watch} from 'vue'
import {ColumnConfigInterface} from "../model/column";
import Input from "./table/Input.vue"
import {CompiledFunc, compileScript} from "../services/compiler";
import {
    EventHandlerConfigInterface,
    FieldConfigInterface,
    generateEntityWithDefault
} from "../model/field";
import {useSyncService} from "../services/sync.service";
import {useDataSourceService} from "../services/datasource.service";
import Cell from "./table/Cell.vue";
import _ from "lodash";
import {CustomDataSource, DataSourceInterface} from "../model/datasource";
import {useI18n} from "vue-i18n";
import {ElMessageBox} from "element-plus";

interface Props {
    id: string,
    title?:string,
    modelValue?: any[],
    field?: string,
    datasource: string,
    fieldConfig?: FieldConfigInterface,
    columns: ColumnConfigInterface[],
    readonly ?: boolean,
    actionButtonsVisible?: boolean,
    context: any,
    onRowClick?: EventHandlerConfigInterface,
    onRowDoubleClick?: EventHandlerConfigInterface,
    onEdit?: EventHandlerConfigInterface,
    onAdd?: EventHandlerConfigInterface,
    onRemove?: EventHandlerConfigInterface
    onClickAdd?: () => (void)
    onClickEdit?: () => (void)
    onClickDelete?: () => (void),
}
const props = withDefaults(defineProps<Props>(), {
    readonly: false,
    actionButtonsVisible: true,
    infinitiveScroll: false
})
let actions = ref({
    onRowDoubleClick: null,
    onRowClick: null,
    onEdit: null,
    onAdd: null,
    onRemove: null
})

const emit = defineEmits(['rowDblClick', 'rowClick', 'change', 'update:modelValue'])

interface CellRef {row: number, col: number}

let _columns = ref<ColumnConfigInterface[]>([])
let editingCell = ref<CellRef | null>(null)
let editEl = ref(null)
let table = ref(null)
let dsService = useDataSourceService()
let dataSource:DataSourceInterface = null
const { t } = useI18n();
let selectedIds = ref<string[]>([])
let currentId = ref(null)
let isTree = ref(false)
let skipInGet = 0;
let canLoadNext = ref(false)

let data = ref<Array<any>>([])

let sync = useSyncService()
const configAlias = `config/table-config-${props.id}`

watch(() => props.modelValue,
    async () => {
        await getData();
    })

watch(() => props.field, load)
watch(() => props.datasource, load)
onMounted(load);

async function load() {
    await init();
    await initColumns();
    await getData();
}

onUnmounted(() => {
    if (dataSource) {
        dataSource.removeListener('item-inserted', onItemInserted)
        dataSource.removeListener('item-updated', onItemUpdated)
        dataSource.removeListener('item-removed', onItemRemoved)
        dataSource.removeListener('update', onDataSourceUpdate)
    }
})




async function addSibling() {
    console.log('addSibling')


    let item = await generateEntityWithDefault(dataSource.fields)
    console.log(item.id, item, currentId.value)

    let parentId = null
    if (currentId.value) {
        let current = await dataSource.getById(currentId.value)
        if (current && current.parentId) {
            parentId = current.parentId
        }
    }

    await dataSource.insert(item.id, item, parentId)

}

async function add() {
    if (actions.value.onAdd) {
        await execAction(actions.value.onAdd)
    } else if (props.onClickAdd instanceof Function) {
        props.onClickAdd()
    } else{
        let item = await generateEntityWithDefault(dataSource.fields)
        //console.log(item.id, item, currentId.value)
        await dataSource.insert(item.id, item, currentId.value)
    }
}

function edit() {
    if (actions.value.onEdit) {
        execAction(actions.value.onEdit)
    } else {
        console.log("No action for edit button")
    }
}

function remove() {
    ElMessageBox.confirm(
        t('confirmDeleteTitle'),
        t('delete'),
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    )
        .then(() => {

            if (actions.value.onRemove) {
                execAction(actions.value.onRemove)
            } else {
                console.log(data.value)
                if (selectedIds.value.length) {

                    selectedIds.value.forEach(id => {
                        console.log(id, selectedIds.value)
                        dataSource.removeById(id)
                    })
                } else if (currentId.value) {
                    console.log(currentId.value)
                    dataSource.removeById(currentId.value)
                }

            }
        }).catch(() => {})
}

function loadChildren(item, treeNode: unknown, resolve: (date: any[]) => void) {
    resolve([])
}

async function getTreePath(id:string) : Promise<any> {

    let item = await dataSource.getById(id)

    if (!item)
        return undefined

    let pathA = [id]
    while (item.parentId) {
        pathA.unshift(item.parentId)
        item = await dataSource.getById(item.parentId)
    }

    let d = data.value
    let path = ""
    pathA.forEach(item => {

        let index = _.findIndex(d, (o:any) => { return o && o.id == item; });
        d = d[index].children

        if (path === "") {
            path = `[${index}]`
        } else {
            path += `.children[${index}]`
        }
    })

    return path
}

async function getData() {
    if (!dataSource) {
        console.warn(`Datasource for Table doesn't set`)
        console.log(props)
        return;
    }

    if (props.field) {
        data.value = props.modelValue
        await dataSource.setData(props.modelValue)
    } else {
        data.value = []
        skipInGet = 0
        await loadNext()
    }
}

async function loadNext() {
    let take = 50
    let nextVal = await dataSource.getMany([], take, skipInGet);
    canLoadNext.value = nextVal.length === take

    if (nextVal.length) {
        data.value = data.value.concat( nextVal )
        skipInGet += take
    }
}


function getInputCellStyle() {
    let style:any = {}
    //display: inline-flex; width:
    if (dataSource.isTree && editingCell.value.col === 1) {
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

function setCurrentCell(cell: CellRef) {

    if (editingCell.value !== cell) {
        editingCell.value = cell
    }

    editingCell.value = cell
}

function getField(field: string) {
    if (!dataSource)
        return undefined;

    let f = dataSource.getFieldByAlias(field)

    if (!f)
        console.warn(`Field "${field}" doesn't exists in data source "${dataSource.alias}"`)

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
    selectedIds.value = ids;
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

function getColumn(id: string) {
    for(let i in _columns.value) {
        if (_columns.value[i].id === id) {
            return _columns.value[i]
        }
    }
    return undefined
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
    currentId.value = row ? row.id : undefined
}

function onCellInput(scope: any, value: any) {
    dataSource.setValue(scope.row.id, scope.column.property, value)
}

async function getFieldReadonly(field:string, scope: any):Promise<boolean> {
    let fGetReadonly = await dataSource.getFieldByAlias(field).getReadonlyFunc()
    if (fGetReadonly) {
        return await fGetReadonly.exec(getRowContext(scope))
    }
    return false
}

async function handleCellClick(scope:any) {
    //console.log(dataSource.readonly, props.readonly, (await getFieldReadonly(scope.column.property, scope)))
    if (!dataSource.readonly &&
        !props.readonly &&
        !getColumn(scope.column.rawColumnKey).readonly &&
        !(await getFieldReadonly(scope.column.property, scope))
        )
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

let getCellData = (scope: any) => {
    if (!dataSource)
        return;

    return scope.row[scope.column.property]
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

let onItemUpdated = async (id, item) => {
    //console.log('item-updated', id, item)
    if (dataSource.isTree) {
        let path = await getTreePath(id)
        _.set(data.value, path, item)
    } else {
        let idx = _.findIndex(data.value, (o:any) => { return o && o.id == id; })
        if (idx >= 0)
            data.value[idx] = item
    }


    emit('update:modelValue', data.value)
    emit('change', data.value)
}

let onItemInserted = async (id, item) => {
    //console.log('item-inserted', id, item)
    if (dataSource.isTree && item.parentId) {
        let path = await getTreePath(item.parentId)
        let parentItem = _.get(data.value, path)

        if (!parentItem.children) parentItem.children = []

        parentItem.children.push(item)

    } else {
        data.value.push(item)
    }
    emit('update:modelValue', data.value)
    emit('change', data.value)
}

let onItemRemoved = async (id, item) => {
    //console.log('item-removed', id, item)
    if (dataSource.isTree) {
        let path = await getTreePath(item.parentId)
        let parentItem = _.get(data.value, path)

        for(let i in parentItem.children) {
            if (parentItem.children[i].id === id) {
                parentItem.children.splice(i, 1)
            }
        }
    } else {
        let idx = _.findIndex(data.value, (o: any) => {
            return o && o.id == id;
        })
        if (idx >= 0)
            data.value.splice(idx, 1)
    }
    emit('update:modelValue', data.value)
    emit('change', data.value)
}

let onDataSourceUpdate = async (dt) => {
    data.value = dt
    emit('update:modelValue', data.value)
}

async function init() {
    setCurrentCell(null)
    data.value = []


    actions.value.onRowDoubleClick = await compileAction(props.onRowDoubleClick)
    actions.value.onRowClick = await compileAction(props.onRowClick)
    actions.value.onAdd = await compileAction(props.onAdd)
    actions.value.onEdit = await compileAction(props.onEdit)
    actions.value.onRemove = await compileAction(props.onRemove)

    if (props.datasource) {
        dataSource = dsService.getDataSourceByAlias(props.datasource)
    }

    if (dataSource) {
        isTree.value = dataSource.isTree
        dataSource.on('item-updated', onItemUpdated)
        dataSource.on('item-inserted', onItemInserted)
        dataSource.on('item-removed', onItemRemoved)
        dataSource.on('update', onDataSourceUpdate)

        if (dataSource instanceof CustomDataSource) {
            dataSource.setContext(props.context)
        }

    }
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
