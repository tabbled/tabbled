<template>
    <div style="padding-bottom: 16px">
        <el-button type="primary" @click="add" size="small">
            {{t('add')}}
        </el-button>
        <el-button @click="edit" size="small">
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
            :load="loadChildren"
            lazy
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
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

import {onMounted, onUnmounted, ref, watch} from 'vue'
import {ColumnConfigInterface} from "../model/column";
import Input from "./table/Input.vue"
import {CompiledFunc, compileScript} from "../services/compiler";
import {EventHandlerConfigInterface, FieldConfigInterface, generateEntityWithDefault} from "../model/field";
import {useSyncService} from "../services/sync.service";
import {useDataSourceService} from "../services/datasource.service";
import Cell from "./table/Cell.vue";
import _ from "lodash";
import {DataSourceInterface} from "../model/datasource";
import {useI18n} from "vue-i18n";
import {ElMessageBox} from "element-plus";

interface Props {
    id: string,
    modelValue?: Promise<any>
    field?: string,
    datasource: string,
    fieldConfig?: FieldConfigInterface,
    columns: ColumnConfigInterface[],
    readonly ?: boolean,
    context: any,
    onRowClick?: EventHandlerConfigInterface
    onRowDoubleClick?: EventHandlerConfigInterface
    onEdit?: EventHandlerConfigInterface
    onAdd?: EventHandlerConfigInterface
    onRemove?: EventHandlerConfigInterface
    update?: number
}
const props = withDefaults(defineProps<Props>(), {
    readonly: false
})
let actions = ref({
    onRowDoubleClick: null,
    onRowClick: null,
    onEdit: null,
    onAdd: null,
    onRemove: null
})

const emit = defineEmits(['rowDblClick', 'rowClick', 'change', 'update:modelValue'])
let updateKey = ref(0)

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

let data = ref<Array<any>>([])

let sync = useSyncService()
const configAlias = `config/table-config-${props.id}`


watch(() => props.field,
    async () => {
        await init();
        await initColumns();
        await getData();
    })

watch(() => props.datasource,
    async () => {
        await init();
        await initColumns();
        await getData();
    })

watch(() => props.update,
    async () => {
    console.log('props.modelValue', await props.modelValue)
        // if (props.field)
        //     await getData();
    })

watch(() => props.modelValue,
    async () => {
        //console.log('props.modelValue', await props.modelValue)

        if (props.field && dataSource) {
            let data = await props.modelValue
            console.log(data)

            if (data)
                await dataSource.setData(data)
        }

    })

onMounted(async () => {
    await init();
    await initColumns();
    await getData();

});

onUnmounted(() => {
    // if (props.fieldDataSet) {
    //     props.fieldDataSet.removeListener('open', getFieldData)
    //     props.fieldDataSet.removeListener('update', getFieldData)
    // }
    //
    //
    // props.dataSet.removeListener('update', setDataToFieldDataSet)
})

async function add() {
    if (actions.value.onAdd) {
        await execAction(actions.value.onAdd)
    } else {
        let item = await generateEntityWithDefault(dataSource.fields)
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
    console.log(item)
    resolve([])
}

async function getTreePath(id:string) : Promise<any> {

    let item = await dataSource.getById(id)

    console.log(id, item)

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
    data.value = []
    if (!dataSource) {

        console.warn(`Datasource for Table doesn't set`)
        console.log(props)
        return;
    }


    if (props.field) {
        data.value = await props.modelValue
    } else {
        data.value = await dataSource.getAll();
    }

    console.log(data.value)
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
    if (!dataSource.readonly && !props.readonly && !(await getFieldReadonly(scope.column.property, scope)))
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
    if (!dataSource)
        return;

    // return await props.dataSet.getValue(scope.row.id, scope.column.property)


    let id = scope.row.id
    if (!id) return

    let field = scope.column.property
    let item = await dataSource.getById(id)

    if (!item) {
        console.error(`Entity by id ${id} not found`)
        return
    }

    let f = dataSource.getFieldByAlias(field)
    let ctx = _.cloneDeep(!props.context ? {} : props.context)
    ctx.row = item

    let getValueFunc = await f.getValueFunc()

    if (getValueFunc) {
        try {
            return await getValueFunc.exec(ctx)
        } catch (e) {
            console.error(`Error while evaluating field ${f.alias} function setValue of datasource ${dataSource.alias}`)
            console.error(e)
            return 'Error'
        }
    } else {
        try {
            return item[field]
        } catch (e) {
            console.error(e)
        }
    }
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
        dataSource.on('update', async (data) => {
            //data.value = data
            console.log('update', data)
            emit('update:modelValue', data)
            emit('change', data)
        })
        dataSource.on('item-updated', async (id, item) => {
            console.log('item-updated', id, item)

            if (dataSource.isTree) {
                let path = await getTreePath(id)
                _.update(data.value, path, item)
                updateKey.value++
            } else {
                let idx = _.findIndex(data.value, (o:any) => { return o && o.id == id; })
                if (idx >= 0)
                    data.value[idx] = item
            }


            emit('update:modelValue', data.value)

        })
        dataSource.on('item-inserted', async (id, item) => {
            console.log('item-inserted', id, item)
            if (dataSource.isTree && item.parentId) {
                let path = await getTreePath(item.parentId)
                let parentItem = _.get(data.value, path)

                if (!parentItem.children) parentItem.children = []

                parentItem.children.push(item)

            } else {
                data.value.push(item)
            }

            updateKey.value++
            emit('update:modelValue', data.value)
        })
        dataSource.on('item-removed',async (id, item) => {
            console.log('item-removed', id, item)
            if (dataSource.isTree) {
                let path = await getTreePath(item.parentId)
                let parentItem = _.get(data.value, path)

                console.log(path)

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
        })
    }



    // console.log('init', dataSource)
    // if (props.dataSet) {
    //
    //     data.value = props.dataSet.data
    //
    //     props.dataSet.on('update', () => {
    //         updateKey.value += 1
    //         data.value = props.dataSet.data
    //         console.log('update')
    //     })
    //     props.dataSet.on('open', () => {
    //         console.log('open')
    //         data.value = props.dataSet.data
    //     })
    // }


    // If props.fieldDataSet is set than it is a field table we should get/set data from props.fieldDataSet
    // if(props.fieldDataSet) {
    //
    //     if (!props.field) {
    //         console.error(`Field for field table not set`)
    //         return
    //     }
    //
    //     let field = props.fieldDataSet.dataSource.getFieldByAlias(props.field)
    //
    //     if (!field) {
    //         console.error(`DataSource "${props.fieldDataSet.dataSource.alias}" of field for field "${props.field}" table doesn't exist`)
    //         return
    //     }
    //
    //     console.log('emits')
    //     props.fieldDataSet.on('open', getFieldData)
    //     props.fieldDataSet.on('update', getFieldData)
    //     props.dataSet.on('update', setDataToFieldDataSet)
    //
    //     if (props.fieldDataSet.isOpen && props.fieldDataSet.current) {
    //         getFieldData()
    //     }
    // }
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
