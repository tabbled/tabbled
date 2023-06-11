<template>
    <div v-if="dataSource && actionButtonsVisible" style="padding-bottom: 16px; display: flex;  margin-right: 16px">
        <el-button v-if="(actions.onAdd || (!actions.onAdd && !isTree) || onClickAdd) " type="primary" @click="add" size="small">
            {{t('add')}}
        </el-button>
        <el-dropdown v-else
                     split-button
                     type="primary"
                     @click="add"
                     size="small"
                     style="margin-right: 8px; min-width: fit-content;"
        >
            {{$t('add')}}
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="addSibling">{{$t('addSibling')}}</el-dropdown-item>
                    <el-dropdown-item @click="add">{{$t('addChild')}}</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-button v-if="actions.onEdit" @click="edit" size="small">
            {{t('edit')}}
        </el-button>
        <el-button v-if="selectedIds.length || currentId" @click="remove" size="small">
            {{t('delete')}}
        </el-button>

        <el-input v-if="canSearch" style="margin-left: 8px;"
                  size="small"
                  :placeholder="$t('search')"
                  @input="searchChange"
                  :model-value="searchText"/>

<!--        This is strange thing, whithout this input the first input while keydown the enter key that reload app
            Maybe it is Element-plus' bag -->
        <el-input style="width: 0; height: 0; opacity: 0"/>


        <el-popover
            placement="bottom"
            :title="$t('filters.title')"
            :width="400"
            :visible="filtersPopoverVisible"
            content="this is content, this is content, this is content"
        >
            <template #reference>
                <el-badge style="margin-bottom: 1px; height: 10px" :value="customFiltersCount" :hidden="!customFiltersCount">


                    <el-button v-if="props.filters && filtersVisible" text size="small" style="margin-left: 8px; margin-bottom: 10px" @click="filtersPopoverVisible = !filtersPopoverVisible">
                        <Icon icon="ic:sharp-filter-list" width="20"/>
                    </el-button>

                </el-badge>
            </template>
            <template #default>
                <CustomFilterConstructor
                    v-if="props.filters &&  filtersVisible"
                    :id="id"
                    :filters="props.filters"
                    :data-source="datasource"
                    :close-button="true"
                    @apply="(cnt) => {customFiltersCount = cnt; filtersPopoverVisible = false}"
                    @close="filtersPopoverVisible = false"

                />
            </template>
        </el-popover>


    </div>
    <el-table

            ref="table"
            border
            :data="data"
            :fit="true"
            row-key="id"
            :height="getHeight()"
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
            @sort-change="sortChange"
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
                       :model-value="scope.row[scope.column.property]"
                       :field="getField(element.field)"
                       @update:model-value="(val) => onCellInput(scope, val)"
                       @keydown="inputKeyDown"
                       :style="getInputCellStyle()"
                       :context="getRowContext(scope)"
                />
                <div v-else @click="() => handleCellClick(scope)" class="table-cell-text">
                    <Cell :model-value="getCellData(scope)"
                          :field="getField(element.field)"
                          :column="getColumn(scope.column.rawColumnKey)"
                          @click="cellFocusedOut()"
                    />
                </div>

            </template>
            <template #header="scope">
                {{getHeaderTitle(scope)}}
            </template>
        </el-table-column>

        <template #append >
            <div style="display: flex; flex-direction: row; align-items: center">
                <el-button v-if="dataSource && canLoadNext" style="margin: 16px" @click="loadNext(data.length)">
                    {{$t('loadNext')}}
                </el-button>
                <div v-if="showCount" style="padding-left: 8px">{{$t('count')}}: {{itemsCount}}</div>
            </div>

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
import {CustomDataSource, DataSourceInterface, GetDataManyOptions} from "../model/datasource";
import {useI18n} from "vue-i18n";
import {dayjs, ElMessage, ElMessageBox} from "element-plus";
import {Filters} from "../model/filter";
import { useElementBounding, useDebounceFn } from '@vueuse/core'
import CustomFilterConstructor from "./CustomFilterConstructor.vue";


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
    filters?: Filters,
    height?: number,
    fillHeight?: boolean,
    showCount?: boolean,
    filtersVisible?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    readonly: false,
    actionButtonsVisible: true,
    infinitiveScroll: false,
    fillHeight: false,
    showCount: false,
    filtersVisible: true,
    filters: () => {
        return new Filters(null)
    }
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
let canLoadNext = ref(false)
let searchText = ref('')
let searchVal = ""
let loadingData = ref(false)
let sort = ref<{order: string | null, prop: string | null}>(null)
let canSearch = ref(false)
let availableHeight = 200
let itemsCount = ref(0)
let filtersPopoverVisible = ref(false)
let customFiltersCount = ref(0)

const tableBounding = useElementBounding(table)

const debouncedSearch = useDebounceFn(() => {
    loadNext()
}, 200, {maxWait: 1000})

let data = ref<Array<any>>([])

let sync = useSyncService()
const configAlias = `config/table-config-${props.id}`

watch(() => props.modelValue,
    async () => {
        await getData();
    })

watch(() => props.field, load)
watch(() => props.datasource, load)
onMounted(async () => {
    await load()
});

watch(() => props.filters?.filters, () => loadNext())

function getHeight() {
    if (props.fillHeight) {
        return props.height - tableBounding.top.value
    }
    return props.height ? props.height : null
}

async function load() {
    await init();
    await initColumns();
    await getData();
}

onUnmounted(() => {
    if (dataSource) {
        //dataSource.removeListener('item-inserted', onItemInserted)
        //dataSource.removeListener('item-updated', onItemUpdated)
        //dataSource.removeListener('item-removed', onItemRemoved)
        dataSource.removeListener('update', onDataSourceUpdate)
    }
})




async function addSibling() {
    console.log('addSibling')


    let item = await generateEntityWithDefault(dataSource.fields)
    //console.log(item.id, item, currentId.value)

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
    } else {
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
                //console.log(data.value)
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

function searchChange(e) {
    searchText.value = e
    searchVal = e
    debouncedSearch()
}

function sortChange(e) {
    sort.value = e
    loadNext()
}

// function loadChildren(item, treeNode: unknown, resolve: (date: any[]) => void) {
//     resolve([])
// }

async function getTreePath(id:string) : Promise<any> {
    let item = await dataSource.getById(id)

    if (!item)
        return undefined

    let pathA = [id]
    while (item.parentId) {
        pathA.unshift(item.parentId)
        item = await dataSource.getById(item.parentId)
    }

    let d = dataSource.data
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
        //console.log('getData', props.field)
        data.value = props.modelValue

        await dataSource.setData(props.modelValue)
    } else {
        await loadNext()
    }
}

async function loadNext(skip: number = 0) {

    if (loadingData.value)
        return

    loadingData.value = true
    let options: GetDataManyOptions = {
        take: 50,
        skip: skip,
        filter: [],
        fields: props.columns.map(i => i.field)
    }

    if (searchText.value) {
        options.search = searchVal
    }

    if (props.filters)
        options.filter.push(...props.filters.filters)

    if (sort.value && sort.value.order) {
        options.sort = {
            field: sort.value.prop,
            ask: sort.value.order === 'ascending'
        }
    }

    try {
        await dataSource.getMany(options);
        canLoadNext.value = dataSource.hasNext()
        itemsCount.value = dataSource.count()
    } catch (e) {
        console.error(e)
        ElMessage.error(e.toString())
    }
    loadingData.value = false
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
    if (!dataSource || !field)
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
        return t('error')

    return col.title
}

async function getCellData(scope: any) {
    //console.log('getCellData', dataSource.alias)

    let field = getField(scope.column.property)
    if (!dataSource || !field)
        return '';

    let value = scope.row[scope.column.property]

    if (field.config.getValue) {
        try {
            value = await getValueFunc()
        } catch (e) {
            console.error(e)
            return 'Error'
        }
    }

    if (value === undefined || value === null)
        return ""

    let display
    switch(field.type) {
        case "text":
        case "bool":
        case "string": display = value; break;
        case "enum": display = getEnumValue(); break;
        case "link": display = await getLinkValue(); break;
        case "number": display = formatNumber(value, field.precision, field.config.format); break;
        case "date": display = dayjs(value).format('DD.MM.YYYY'); break;
        case "time": display = dayjs(value).format('hh:mm:ss'); break;
        case "datetime": display = dayjs(value).format('DD.MM.YYYY hh:mm:ss'); break;
        default: display = 'Error'
    }

    return display

    async function getLinkValue() {
        if (field.config.getValue)
            return value

        if (value && scope.row[`_${field.alias}_title`]) {
            return scope.row[`_${field.alias}_title`]
        }

        if (value && scope.row[`${field.alias}_title`]) {
            return scope.row[`${field.alias}_title`]
        }

        //displayProp.value = props.field.displayProp ? props.field.displayProp : 'name';
        let ds = await dsService.getByAlias(field.datasource);

        if (!ds) {
            console.warn(`DataSource for link data for field "${field.alias}" doesn't set`)
            return ""
        }

        if (field.isMultiple) {
            return value
        } else {

            let link_entity = await ds.getById(value)
            if (!link_entity)
                return t('notFound')
            return link_entity[field.displayProp ? field.displayProp : 'name']
        }
    }

    function getEnumValue() {
        if (field.config.getValue)
            return value

        for(const i in field.values) {
            if (field.values[i].key === value) {
                return field.values[i].title
            }
        }
        return t('notFound')
    }

    function formatNumber(value: any, precision: number, format: any) {
        if (value === undefined || value === null || value === "")
            return "";

        if (format && format !== 'none') {
            return Number.parseFloat(Number(value).toFixed(precision)).toLocaleString('ru-RU')
        }

        return value
    }



    async function getValueFunc() {

        let getValueFunc = await field.getValueFunc()

        if (getValueFunc) {
            try {
                return await getValueFunc.exec(getRowContext(scope))
            } catch (e) {
                console.error(`Error while evaluating field ${field.alias} getValue function `)
                console.error(e)
                return null
            }
        }
        return null;
    }
}




function getRowClass() {
    return "table-row"
}

function getHeaderClass() {
    return "table-header"
}

async function initColumns() {
    _columns.value = props.columns || []
    let widths = await sync.getValue(configAlias)

    for(let i in _columns.value) {
        const col = _columns.value[i]


        if (widths && widths[col.id]) {
            col.width = widths[col.id]
        }
    }
}

let onItemUpdated = async (id, item) => {

    if (!id || !item)
        return;

    //console.log('item-updated', id, item)

    // if (dataSource.isTree) {
    //     let path = await getTreePath(id)
    //     _.set(data.value, path, item)
    // } else {
    //     let idx = _.findIndex(data.value, (o:any) => { return o && o.id == id; })
    //     if (idx >= 0)
    //         data.value[idx] = item
    // }

    data.value = dataSource.data

    emit('update:modelValue', dataSource.data)
    emit('change', dataSource.data)
}

let onItemInserted = async (id, item) => {
    console.log('item-inserted', id, item)

    data.value = dataSource.data
    emit('update:modelValue', dataSource.data)
    emit('change', dataSource.data)
}

let onItemRemoved = async (id, item) => {
    console.log('item-removed', id, item)

    data.value = dataSource.data
    emit('update:modelValue', dataSource.data)
    emit('change', dataSource.data)
}

let onDataSourceUpdate = async () => {
    console.log('>>>> DS updated', dataSource.alias)

    data.value = dataSource.data

    emit('update:modelValue', dataSource.data)
    emit('change', dataSource.data)
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

        dataSource = await dsService.getByAlias(props.datasource)
    }

    if (dataSource) {
        isTree.value = dataSource.isTree

        canSearch.value = dataSource.source !== 'custom'

        //dataSource.on('item-updated', onItemUpdated)
        //dataSource.on('item-inserted', onItemInserted)
        //dataSource.on('item-removed', onItemRemoved)
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
