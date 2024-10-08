<template>
    <div v-if="dataset" class="table-wrapper">
        <div class="table-title">
            <div class="table-actions">
                <h4 v-if="title" class="table-title-caption">{{title}}</h4>
                <el-button type="primary" size="small" @click="">Add</el-button>
            </div>
            <div class="table-actions-ext">
                <el-input clearable
                          :placeholder="$t('search')"
                          :prefix-icon="SearchIcon"
                          style="height: 24px; width: 150px"
                          size="small"
                          @input="debouncedSearch()"
                          v-model="searchText"/>
                <el-button type="info" round circle text :icon="SettingsIcon" class="table-settings-button" @click="emit('settings-request', '', 'TableV2')"/>
            </div>

        </div>


        <div class="table-header" ref="tableHeader">
            <el-progress v-if="dataset && dataset.isLoading" class="load-progressbar" :percentage="100"  :indeterminate="true" :show-text="false"/>
            <table :style="{ width: `${table.getTotalSize()+10}px`, 'max-width': `${table.getTotalSize()+10}px`, 'margin-right': '32px'}">
                <thead>
                <tr
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                >
                    <th
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        :ref="`col_${header.id}`"
                        :colSpan="header.colSpan"
                        :style="{ width: `${ header.getSize()}px` }"
                        :draggable="!header.column.getIsResizing()"
                        @dragstart="onDragStart($event, header)"
                        @dragover="onDragOver"
                        @dragend="onDragEnd"
                        @dragenter="onDragEnter"
                        @dragover.prevent
                        @dragenter.prevent
                        @click="onHeaderClick($event, header)"
                        @contextmenu.prevent="openHeaderMenu($event, header)"
                    >
                        <div class="cell">

                            <div class="columnHeaderTitle">
                                <Checkbox v-if="header.index === 0"
                                          id="column-header-checkbox"
                                          class="select-checkbox"
                                          :indeterminate="table.getIsSomeRowsSelected()"
                                          :checked="table.getIsAllRowsSelected()"
                                          @change="table.getToggleAllRowsSelectedHandler()($event)"
                                />
                                <FlexRender
                                    v-if="!header.isPlaceholder"
                                    :render="header.column.columnDef.header"
                                    :props="header.getContext()"
                                />
                                <div class="sort-icon" v-if="header.column.getIsSorted()">
                                    <IconArrowUp v-if="header.column.getIsSorted() === 'asc'"/>
                                    <IconArrowDown v-else/>
                                </div>
                            </div>

                            <div
                                id="resizer"
                                :class="{resizer:true, isResizing: header.column.getIsResizing() }"
                                 @mousedown="(e) => { (header.getResizeHandler())(e) } "
                            />
                        </div>
                    </th>

                </tr>
                </thead>
            </table>
        </div>
        <div class="table-body" ref="tableContainer"
             v-infinite-scroll="getData"
             :infinite-scroll-disabled="!props.dataset || props.dataset.isLoading || props.dataset.allDataLoaded"
             :infinite-scroll-distance="60"
             @scroll="onBodyScroll"
        >

            <table ref="tableBodyRef" :style="{ width: `${table.getTotalSize()}px`, 'max-width': `${table.getTotalSize()+10}px`}">
                <tbody>
                <tr  v-for="row in table.getRowModel().rows"
                     :key="row.id "
                     @click="onClickRow($event, row)"
                     :class="{rowSelected: row.getIsSelected(), 'table-row': true}"
                     :style="{height: '32px'}"
                >
                    <td v-for="cell in row.getVisibleCells()"
                        :key="cell.id"
                        @click="onCellClick(cell)"
                        :style="{ width: `${cell.column.getSize()}px`, height: 'inherit' }"
                        :class="{'cell-selected': selectedCellId === cell.id}"
                    >
                        <div :class="{cell: true  } " >
                            <Checkbox v-if="cell.column.getIndex() === 0"
                                      id="row-checkbox"
                                      class="select-checkbox"
                                      :indeterminate="false"
                                      style="z-index: 100"
                                      :checked="row.getIsSelected()"
                                      :disabled="!row.getCanSelect()"
                                      @change="row.getToggleSelectedHandler()($event)"
                            />

                            <CellRenderer :cell="cell"
                                          :field="cell?.column?.columnDef?.meta['field']"
                                          :column-def="cell?.column?.columnDef?.meta['column']"
                            />
<!--                            <div >-->
<!--                                {{cell?.column?.columnDef?.meta}}-->
<!--                            </div>-->

<!--                            <FlexRender v-if="cell"-->
<!--                                :render="cell?.column?.columnDef?.cell"-->
<!--                                :props="cell?.getContext()"-->
<!--                            />-->
                        </div>

                    </td>
                </tr>

            </tbody>
        </table>
        </div>
        <div class="table-footer" ref="tableFooter">
            <table :style="{ width: `${table.getTotalSize()}px`, 'max-width': `${table.getTotalSize()+10}px`, 'margin-right': '32px'}">
                <tfoot>
                <tr
                    v-for="footerGroup in table.getFooterGroups()"
                    :key="footerGroup.id"
                >
                    <th
                        v-for="header in footerGroup.headers"
                        :key="header.id"
                        :colSpan="header.colSpan"
                        :style="{ width: `${header.getSize()}px` }"
                    >
                        <div class="cell">
                            <FlexRender
                                v-if="!header.isPlaceholder"
                                :render="header.column.columnDef.footer"
                                :props="header.getContext()"
                            />
                        </div>
                    </th>
                </tr>
                </tfoot>
            </table>
        </div>
        <ContextMenu :actions="contextMenuActions"
                     ref="contextMenu"
                     :x="contextMenuX"
                     v-model:visible="showContextMenu"
                     :y="contextMenuY"/>
    </div>



</template>

<script setup lang="ts">

import {
    ColumnDef,
    createColumnHelper,
    FlexRender,
    getCoreRowModel,
    RowSelectionState,
    useVueTable,
    Updater,
    ColumnSizingState
} from '@tanstack/vue-table'
import {onMounted, onUnmounted, ref, watch} from 'vue'
import Checkbox from './Checkbox.vue'
import Table from "../Table.vue";
import IconArrowDown from "../icons/sort-arrow-down-icon.vue";
import IconArrowUp from "../icons/sort-arrow-up-icon.vue";
import SettingsIcon from "../icons/settings-icon.vue";
import SearchIcon from "../icons/search-icon.vue"
import {DataSetInterface} from "../dataset";
import {ElMessage} from "element-plus";
import ContextMenu from "./ContextMenu.vue";
import {ContextMenuAction} from "./context-menu-action";
import {useI18n} from "vue-i18n"
import {Column} from "../column"
import Locales from "./locales"
import _ from "lodash";
import {useDebounceFn} from "@vueuse/core";
import CellRenderer from "./CellRenderer.vue";

const {t, setLocaleMessage, availableLocales} = useI18n({
    useScope: "local"
})


interface Props {
    id: string
    dataset: DataSetInterface
    title?: string
    height: number
    inlineEdit: boolean
    columns: Column[]
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
    datasourceType: 'datasource',
    height: 400,
    inlineEdit: false,
    columns: () => []
})

const refresh = () => {
    if (props.dataset) {
        props.dataset.loadNext(true)
    }
}

defineExpose({ refresh })

const emit = defineEmits<{
    (e: 'settings-request', path: string, component: string): void,
    (e: 'update:property', prop: string, value: any): string
}>()


let tableContainer = ref(null)
let tableBodyRef = ref(null)
let cellRendererRefs = ref({})
let tableHeader = ref(null)
let tableFooter = ref(null)
const columnHelper = createColumnHelper()
let selectedCellId = ref(null)
let searchText = ref("")
let contextMenu = ref(null)
let showContextMenu = ref(false)
let contextMenuX = ref(0)
let contextMenuY = ref(0)

const contextMenuActions = ref<ContextMenuAction[]>([]);
let columns = ref<ColumnDef<any, any>[]>([])
let columnOrder = ref([])
let columnWidth = ref<Record<string, number>>({})
let dragColumnId = ref(null)
let beforeDragColumnWidths = []
const rowSelection = ref<RowSelectionState>({})
const sorting = ref()
let page = 1
let pageSize = 30


let headerHeight = '34px'
let rowHeight = ref(30)
let items = ref([])
let fallbackItems = []



let table = useVueTable({
    get data() {
        return items ? items.value : fallbackItems
    },
    get columns() {
        return columns.value
    } ,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    //manualSorting: true,
    onColumnSizingChange: (updater: Updater<ColumnSizingState>) => {
        columnWidth.value =
            typeof updater === 'function'
                ? updater(columnWidth.value)
                : updater

        saveState()
    },
    enableColumnResizing: true,
    columnResizeDirection: 'ltr',
    state: {
        get columnOrder() {
            return columnOrder.value
        },
        get rowSelection() {
            return rowSelection.value
        },
        get sorting() {
            return sorting.value
        },
        get columnSizing() {
            return columnWidth.value
        }
    },
    getRowId: row => row['id'],
    onColumnOrderChange: (order) => {
        console.log('onColumnOrderChange')
        columnOrder.value = (order as string[])
        saveState()
    },
    onSortingChange: (updaterOrValue) => {
        console.log('onSortingChange', props.dataset)
        if (!props.dataset)
            return

        sorting.value =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(sorting.value)
                : updaterOrValue

        saveState()

        updateSorting()
        getData(true)
    },
    enableRowSelection: true,
    onRowSelectionChange: updateOrValue => {
        rowSelection.value =
            typeof updateOrValue === 'function'
                ? updateOrValue(rowSelection.value)
                : updateOrValue
    },
    debugTable: true,
    debugHeaders: false,
    debugColumns: false,
})

const { rows } = table.getRowModel()

onMounted(async () => {
    await init()
})

watch(() => props.columns,
    async () => {
        console.log('TableV2 props changed', props)
        initColumns()
    }, {deep: true})

watch(() => props.dataset,
    async () => {
        await init()
    })


const debouncedSearch = useDebounceFn(() => {
    props.dataset.search = searchText.value
    props.dataset.loadNext(true)
    saveState()
}, 1000, {maxWait: 1000})

const saveState = () => {
    localStorage.setItem(`table_state_${props.id}`, JSON.stringify({
        width: columnWidth.value,
        order: columnOrder.value,
        sorting: sorting.value,
        search: searchText.value
    }))
}

const updateSorting = () => {
    let sort = []
    sorting.value.forEach(i => {
        let c = props.columns.find(c => i.id === c.id)

        sort.push(`${c.field}:${i.desc ? 'desc' : 'asc'}`)
    })
    props.dataset.sort = sort
}

const getData = async (reset = false) => {
    console.log('TableV2.getData', props.dataset)
    if (!props.dataset)
        return

    try {
        await props.dataset.loadNext(reset)
    } catch (e) {
        ElMessage.error(`${t('message.loadingError')}: ${e.toString()}`)
    }
}

const init = async () => {
    console.log('tablev2 init', props)


    availableLocales.forEach(locale => {
        setLocaleMessage(locale as string, Locales[locale as string])
    })

    let state = localStorage.getItem(`table_state_${props.id}`)
    if (state) {
        const pr = JSON.parse(state)
        columnWidth.value = pr.width
        columnOrder.value = pr.order ? pr.order : []
        sorting.value = pr.sorting ? pr.sorting : []
        searchText.value = pr.search
        updateSorting()

        if (props.dataset)
            props.dataset.search = searchText.value
    }

    if (props.dataset) {
        await props.dataset.getFields()
    }

    initColumns()

    if (props.dataset) {
        unsubscribeDatasetEvents()
        subscribeDatasetEvents()
        await getData(true)
    }
}

const initColumns = () => {
    let cols = []
    columns.value = []
    for(let i in props.columns) {
        let col = props.columns[i]

        cols.push(columnHelper.accessor(col.field, {
            id: col.id,
            header: col.title,
            cell: info => { return col.field ? info.getValue() : null } ,
            footer: props => col.field,
            size: col.width && col.width > 0 ? col.width : 150,
            minSize: col.minWidth && col.minWidth > 0 ? col.minWidth : 20,
            enableSorting: col.sortable,
            meta: {
                field: props.dataset.getFieldByAlias(col.field),
                column: col
            }
        }))
    }

    columns.value = cols

    props.dataset.reset()

    if (!columnOrder.value.length)
        columnOrder.value = props.columns.map(i => i.id)
}

const subscribeDatasetEvents = () => {

    // let reset = onDatasetReset.bind({ dataset: props.dataset})
    // let insert = onDatasetInsert.bind({ dataset: props.dataset})

    props.dataset.addListener('reset-data', onDatasetReset)
    props.dataset.addListener('insert', onDatasetInsert)
}

const unsubscribeDatasetEvents = () => {
    props.dataset.removeListener('reset', onDatasetReset)
    props.dataset.removeListener('insert', onDatasetInsert)
}

const onDatasetReset = () => {
    //console.log('onDatasetReset')
    // table.getRowModel().rows = []
    // table.getRowModel().rowsById = {}
    // table.getRowModel().flatRows = []
    items.value = []
}

const onDatasetInsert = (ops) => {
    //console.log("onDatasetInsert", ops)

    let n = _.cloneDeep(items.value)
    n.push(...ops.items)
    items.value = n
}

const onCellClick = (cell) => {
    selectedCellId.value = cell.id
}

const onBodyScroll = async (e) => {
    tableHeader.value.scrollLeft = e.target?.scrollLeft
    tableFooter.value.scrollLeft = e.target?.scrollLeft
}

const onDragStart = (e, header) => {
    e.dataTransfer.effectAllowed = "move";

    dragColumnId.value = header.id
    let dragStartX = e.screenX - e.offsetX

    for(let i = 0; i < header.index; i++) {
        let col = columnOrder.value[i]
        dragStartX -= table.getColumn(col).getSize()
    }

    let sum = dragStartX
    beforeDragColumnWidths = columnOrder.value.map(col => sum += table.getColumn(col).getSize(), sum)

}
const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // @ts-ignore
    let targetIdx = beforeDragColumnWidths.findLastIndex(i => e.screenX > i)

    const newColumnOrder = [...columnOrder.value];
    newColumnOrder.splice(
        targetIdx + 1,
        0,
        newColumnOrder.splice(newColumnOrder.indexOf(dragColumnId.value), 1)[0],
    );
    table.setColumnOrder(newColumnOrder)
}

const onClickRow = (e, row) => {
    if (e.target?.id !== 'row-checkbox')
        table.resetRowSelection(false)

    row.getToggleSelectedHandler()(e)
}

const onHeaderClick = (e, header) => {
    if (e.target?.id !== 'column-header-checkbox' && e.target?.id !== 'resizer') {
        header.column.getToggleSortingHandler()(e)
    }
}

const openHeaderMenu = (e, header) => {
    e.preventDefault();

    contextMenuActions.value = []

    contextMenuActions.value.push({
        title: t("column.insertRight"),
        action: "insertRight",
        onClick: () => {
            let idx = columnOrder.value.findIndex(i => i === header.id)
            insertNewColumn(idx+1)
        }
    },{
        title: t("column.insertLeft"),
        action: "insertLeft",
        onClick: () => {
            let idx = columnOrder.value.findIndex(i => i === header.id)
            insertNewColumn(idx)
        }
    },{
        action: "divider"
    },{
        title: t("column.settings"),
        action: "settings",
        onClick: () => {
            let idx = props.columns.findIndex(i => i.id === header.id)
            emit('settings-request', `columns[${idx}]`, 'Column')
        }
    },{
        action: "divider"
    },{
        title: t("column.delete"),
        action: "delete",
        onClick: () => {
            let idx = props.columns.findIndex(i => i.id === header.id)
            removeColumn(idx)
        }
    })

    contextMenuX.value = e.clientX;
    contextMenuY.value = e.clientY;
    showContextMenu.value = true;

}

const onDragEnd = () => {
    dragColumnId.value = null
}

const onDragEnter = (e) => {
    e.preventDefault()
}

const insertNewColumn = (index: number) => {
    let cols = props.columns
    let max = _.maxBy(cols, (i) => Number(i.id))
    let id = (max ? Number(max.id) + 1 : 1).toString()

    cols.push({
        id: id,
        field: '',
        title: "New column",
        type: 'field',
        width: 120,
        minWidth: 20
    })
    columnOrder.value.splice(index, 0, id)

    emit('update:property', 'columns', cols)
    emit('settings-request', `columns[${cols.length - 1}]`, 'Column')
    saveState()
}

const removeColumn = (index) => {
    let cols = props.columns
    let idx = columnOrder.value.findIndex(i => i === cols[index].id)
    if (idx > -1)
        columnOrder.value.splice(idx, 1)

    cols.splice(index, 1)
    emit('update:property', 'columns', cols)
    saveState()
}

onUnmounted(() => {
    unsubscribeDatasetEvents()
})

</script>

<style lang="scss">

.table-wrapper {
    border: 1px solid var(--el-border-color);
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: auto;
}

.table-title-caption {
    margin-right: 14px;
    cursor: default;
}

.table-title {
    display: flex;
    flex-direction: row;
    padding: 8px 0;
    justify-content: space-between;
}

.table-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 14px;
}

.table-actions-ext {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.table-settings-button {
    z-index: 10;
    margin: 0 4px;
}

.table-body {

    width: inherit;
    overflow: auto;
    height: 100%;
}

table {
    border-collapse: collapse;
}

.table-header {
    position: relative;
    overflow: hidden;
    height: v-bind(headerHeight);
    min-height: v-bind(headerHeight);
    width: inherit;
    border-bottom: 1px solid var(--el-border-color);
}

.table-footer {
    overflow: hidden;
    width: inherit;
    height: v-bind(headerHeight);
    min-height: v-bind(headerHeight);
    border-top: 1px solid var(--el-border-color);
}

thead {
    height: v-bind(headerHeight);
}

.table-row {
    background: var(--el-bg-color);
    cursor: default;
    transition: background-color .04s ease;
    border-bottom: 1px solid var(--el-border-color-light);
}

.table-row.rowSelected:hover {
    background: var(--el-color-primary-light-7);
}

.table-row:hover {
    background-color: var(--el-border-color-extra-light);
}

.rowSelected {
    background: var(--el-color-primary-light-8);
}

td {
    padding: 0;
    position: relative;
}

th {
    padding: 0;
    cursor: pointer;
    position: relative;
}

thead th .cell {
    border-right: 1px solid transparent;
    border-bottom: none;
    height: 32px;
}

tfoot th .cell {
    cursor: default;
    border-right: 1px solid transparent;
    border-bottom: none;
    height: 32px;
}



thead th .cell:hover {
    background: var(--el-border-color-extra-light);
    transition: background-color .12s ease;
}


.cell {
    display: flex;
    flex-direction: row;
    width: inherit;
    min-width: 0;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    padding: 0 8px 0 8px;
    align-content: center;
    height: 100%;

}

:global(th .resizer:hover) .cell {
    background: #747bff;
}

.resizer {
    pointer-events: auto;
    position: absolute;
    top: 8px;
    bottom: 8px;
    right: 0;
    width: 3px;
    padding: 0 1px;
    border-right: 1px solid var(--el-border-color);
    border-radius: 1px;
    //background: rgba(0, 0, 0, 0.5);
    cursor: col-resize;
    user-select: none;
    touch-action: none;
    opacity: 1;
}

.sort-icon {
    opacity: 0.5;
    display: flex;
    align-content: center;
    justify-content: center;
}

.resizer.isResizing {
    border-right: 2px solid var(--el-border-color-darker);
    opacity: 1;
}

.column-header {
    width: inherit;
    height: 32px;
    min-height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.columnHeaderTitle {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.columnHeaderDragIcon {
    cursor: grab;
    width: 20px;
    height: 100%;
    align-items: center;
    display: flex;
}

.select-checkbox {
    margin-right: 10px;
}

.cell-selected {
    box-shadow: inset 0 0 0 1px var(--el-color-primary) ;
    transition: border .14s ease;
}

.loading {
    padding: 10px;
}

.load-progressbar {
    z-index: 10;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    .el-progress-bar__outer {
        height: 2px !important;
        border-radius: 0 !important;
    }
}


</style>