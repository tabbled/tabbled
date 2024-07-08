<template>
    <div class="table-wrapper">
        <div class="table-header" ref="tableHeader">
            <table :style="{ width: `${table.getTotalSize()+10}px`, 'margin-right': '32px'}">
                <thead>
                <tr
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                >
                    <th
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        :colSpan="header.colSpan"
                        :style="{ width: `${header.getSize()}px` }"
                        :draggable="!header.column.getIsResizing()"
                        @dragstart="onDragStart($event, header)"
                        @dragover="onDragOver"
                        @dragend="onDragEnd"
                        @dragenter="onDragEnter"
                        @dragover.prevent
                        @dragenter.prevent
                        @click="onHeaderClick($event, header)"
                    >
                        <div class="cell">

                            <div class="columnHeaderTitle">
                                <Checkbox v-if="header.index === 0"
                                          id="column-header-checkbox"
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
             :infinite-scroll-disabled="isLoading || allDataLoaded"
             :infinite-scroll-distance="60"
             @scroll="onBodyScroll"
        >
            <table :style="{ width: `${table.getTotalSize()}px`}">
                <tbody>
                <tr  v-for="row in table.getRowModel().rows"
                     :key="row.id "
                     class='table-row'
                     @click="onClickRow($event, row)"
                     :class="{rowSelected: row.getIsSelected(), 'table-row': true}"
                >
                    <td v-for="cell in row.getVisibleCells()"
                        :key="cell.id"
                        :style="{ width: `${cell.column.getSize()}px` }"
                    >
                        <div class="cell">
                            <Checkbox v-if="cell.column.getIndex() === 0"
                                      id="row-checkbox"
                                      :indeterminate="false"
                                      style="z-index: 100"
                                      :checked="row.getIsSelected()"
                                      :disabled="!row.getCanSelect()"
                                      @change="row.getToggleSelectedHandler()($event)"
                            />
                            <FlexRender
                                :render="cell.column.columnDef.cell"
                                :props="cell.getContext()"
                            />
                        </div>

                    </td>
                </tr>
                <div class="loading" v-if="isLoading">
                    Loading...
                </div>
            </tbody>
        </table>
        </div>
        <div class="table-footer" ref="tableFooter">
            <table :style="{ width: `${table.getTotalSize()}px`, 'margin-right': '32px'}">
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
    </div>
</template>

<script setup lang="tsx" >

import {createColumnHelper, getCoreRowModel, useVueTable, FlexRender, RowSelectionState, createRow} from '@tanstack/vue-table'
import {onMounted, ref} from 'vue'
import Checkbox from './Checkbox.vue'
import {useDataSourceService} from "../../services/datasource.service";
import {DataSourceInterface, GetDataManyOptions} from "../../model/datasource";
import Table from "../Table.vue";
import {EventHandlerConfigInterface} from "../../model/field";

interface Props {
    id: string
    onRowClick?: EventHandlerConfigInterface
    onRowDoubleClick?: EventHandlerConfigInterface
}

const props = withDefaults(defineProps<Props>(), {

})

const IconArrowDown = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 18l-6-6l1.4-1.4l3.6 3.6V5h2v9.2l3.6-3.6L18 12z"/></svg>
const IconArrowUp = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M11 18V8.8l-3.6 3.6L6 11l6-6l6 6l-1.4 1.4L13 8.8V18z"/></svg>

let tableContainer = ref(null)
let tableHeader = ref(null)
let tableFooter = ref(null)
const columnHelper = createColumnHelper()
let height = 400 + 'px'

let dsService = useDataSourceService()
let dataSource:DataSourceInterface = null





let data = ref([])
const columns =[
    columnHelper.accessor('type', {
        header: "Тип",
        cell: info => info.getValue(),
        footer: props => props.column.id,
        size: 80,
        minSize: 20,
    }),
    columnHelper.accessor('group', {
        id: 'group',
        header: "Группа",
        cell: ({ cell, row }) => {
            return <strong>{row.original['group']}</strong>
        },
        footer: props => props.column.id,
        size: 150,
        minSize: 20,
        enableResizing: true,
    }),//<div><strong>{row.original.firstName}</strong> {row.original.lastName}</div>
    columnHelper.accessor('name', {
        header: "Название",
        cell: info => info.getValue(),
        footer: props => props.column.id,
        size: 120,
        minSize: 20,
    }),
    columnHelper.accessor('price', {
        header: "Цена",
        cell: info => info.getValue(),
        footer: props => props.column.id,
        size: 120,
        minSize: 20,
    })
]

let columnOrder = ref(['type', 'group', 'name', 'price'])
let dragColumnId = ref(null)
let beforeDragColumnWidths = []
const rowSelection = ref<RowSelectionState>({})
const sorting = ref()
let totalDataCount = 0
let page = 1
let pageSize = 30
let isLoading = ref(false)
let allDataLoaded = ref(false)

let headerHeight = '40px'


const table = useVueTable({
    get data() {
        return data.value
    },
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    //manualSorting: true,
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
        }
    },
    getRowId: row => row['id'],
    onColumnOrderChange: (order) => {
        columnOrder.value = (order as string[])
    },
    onSortingChange: (updaterOrValue) => {
        sorting.value =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(sorting.value)
                : updaterOrValue
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

const getData = async (reset = false) => {
    if (isLoading.value || !dataSource)
        return

    isLoading.value = true
    if (reset) {
        page = 0
        totalDataCount = 0
        data.value = []
    }


    let opt:GetDataManyOptions = {
        take: pageSize,
        skip: page * pageSize
    }

    console.log(sorting.value)

    if (sorting.value && sorting.value.length) {
        opt.sort = {
            field: sorting.value[0].id,
            ask: !sorting.value[0].desc
        }
    }


//    console.log(reset, page, totalDataCount, opt)

    try {
        let res = await dataSource.getMany(opt)
        let i = data.value.length
        totalDataCount = res.count



        if (reset) {
            data.value = res.data
        } else {
            data.value.push(...res.data)
            res.data.forEach(item => {
                let r = createRow(table, item.id, item, i++, 0)
                table.getRowModel().rows.push(r)
                table.getRowModel().flatRows.push(r)
                table.getRowModel().rowsById[item.id] = r
            })
        }

        allDataLoaded.value = data.value.length >= res.count
        page++
    } catch (e) {
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

const init = async () => {
    dataSource = await dsService.getByAlias('products')

   await getData(true)
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

const onDragEnd = () => {
    dragColumnId.value = null
}

const onDragEnter = (e) => {
    e.preventDefault()
}

</script>

<style lang="scss">

.table-wrapper {
    height: v-bind(height);
    width: 100%;
    border: 1px solid var(--el-border-color);
    border-radius: 3px;
    display: flex;
    flex-direction: column;
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
    overflow: hidden;
    height: v-bind(headerHeight);
    width: inherit;
    border-bottom: 1px solid var(--el-border-color);
}

.table-footer {
    overflow: hidden;
    width: inherit;
    height: v-bind(headerHeight);
    border-top: 1px solid var(--el-border-color);
}

.table-row {
    background: var(--el-bg-color);
    cursor: default;
    transition: background-color .12s ease;
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
}

th {
    padding: 0;
    cursor: pointer;
    position: relative;
}

thead th .cell {
    border-right: 1px solid transparent;
    border-bottom: none;
}

tfoot th .cell {
    cursor: default;
    border-right: 1px solid transparent;
    border-bottom: none;
}

thead th .cell:hover {
    background: var(--el-border-color-extra-light);
    transition: background-color .12s ease;
}



.cell {
    height: 32px;
    width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-bottom: 1px solid var(--el-border-color-light);
    text-align: left;
    padding: 0 8px 0 8px ;
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



.loading {
    padding: 10px;
}


</style>