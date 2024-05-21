<template>
    <div :style="{ height: `${getHeight()}px`, width: '100%'} ">
        <div v-if="searchVisible || actionButtonsVisible || filtersVisible" style="padding-bottom: 16px; display: flex;">
            <div v-if="actionButtonsVisible" style="display: flex; flex: none">
                <el-button v-if="hasPermission('Add') && (actions.onAdd || (!actions.onAdd && !isTree) || onClickAdd) " type="primary" @click="add" size="small">
                    {{t('add')}}
                </el-button>
                <el-dropdown v-else-if="hasPermission('Add')"
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
                            <el-dropdown-item @click="addChild">{{$t('addChild')}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-button v-if="hasPermission('Edit') && actions.onEdit" @click="edit" size="small">
                    {{t('edit')}}
                </el-button>
                <el-button v-if="hasPermission('Remove')" @click="remove" size="small">
                    {{t('delete')}}
                </el-button>
            </div>

            <el-input v-if="searchVisible" style="margin-left: 8px;"
                      size="small"
                      :id="id"
                      :placeholder="$t('search')"
                      :autofocus="false"
                      @input="searchChange"
                      :model-value="searchText"/>

            <el-input v-if="searchVisible" size="small" style="height: 0; width: 0; opacity: 0"/>


            <el-button v-if="actionButtonsVisible"
                       v-for="action in _customActions"
                       style="margin-left: 8px;"
                       size="small"
                       :type="action.type ? action.type : 'default'"
                       @click="action.func()"
            >
                {{action.title}}
            </el-button>


            <el-popover
                placement="bottom"
                :title="$t('filters.title')"
                :width="500"
                :visible="filtersPopoverVisible"
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
        <ag-grid-vue
            ref="grid"
            class="ag-theme-balham"
            :style="{ height: `calc(100% - ${ actionButtonsVisible ? 40 : 0 }px)`}"
            :columnDefs="columnDefs"
            :defaultColDef="defaultColumnDef"
            rowSelection="multiple"
            animateRows="true"
            @grid-ready="onGridReady"
            rowModelType="serverSide"
            enableCellTextSelection
            :dataTypeDefinitions="dataTypeDefinitions"
            :rowGroupPanelShow="true"
            :components="gridComponents"
            @columnResized="saveColumnState"
            @columnMoved="saveColumnState"
            @columnVisible="saveColumnState"
            @sortChanged="saveColumnState"
            @columnPinned="saveColumnState"
            :treeData="true"
            :getDataPath="getDataPath"
            groupDisplayType='custom'
            :isServerSideGroup="isServerSideGroup"
            :getServerSideGroupKey="getServerSideGroupKey"
            :getRowId="getRowId"
            cacheBlockSize="50"
            :undoRedoCellEditing="true"
            :undoRedoCellEditingLimit="40"
            @cellValueChanged="cellValueChanged"
            :enableCellChangeFlash="false"
            @cellClicked="cellClicked"
            @cellDoubleClicked="cellDoubleClicked"
            @selectionChanged="selectionChanged"
            :pinnedBottomRowData="totalData"
            :context="context_"
            @first-data-rendered="onFirstDataRendered"
            :getContextMenuItems="getContextMenuItems"
        />
    </div>
</template>

<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
import {
    ColDef,
    GridApi,
    ColumnApi,
    ModuleRegistry, IServerSideDatasource,
    //GetContextMenuItemsParams
} from "ag-grid-community"
import {onMounted, onUnmounted, ref, watch} from "vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import {EventHandlerConfigInterface, FieldConfigInterface, generateEntityWithDefault} from "../model/field";
import {ColumnConfigInterface} from "../model/column";
import {Filters} from "../model/filter";
import {PageActionConfigInterface} from "../model/page";
import {useDataSourceService} from "../services/datasource.service";
import {CustomDataSource, DataSourceInterface, GetDataManyOptions} from "../model/datasource";
import {dayjs, ElMessage, ElMessageBox} from "element-plus";
import {useI18n} from "vue-i18n";
import EnumCellEditor from "./table/EnumCellEditor.vue";
import LinkCellEditor from "./table/LinkCellEditor.vue";
import DatetimeCellEditor from "./table/DatetimeCellEditor.vue";
import NumberCellEditor from "./table/NumberCellEditor.vue";
import TreeCellEditor from "./table/TreeCellEditor.vue";
import MultipleCellRenderer from "./table/MultipleCellRenderer.vue";
import TotalsRenderer from "./table/TotalsRenderer.vue"
import {b64toBlob} from "../utils/base64ArrayBuffer.js"

import numeral from 'numeral';
import 'numeral/locales';

import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import {IServerSideGetRowsParams} from "ag-grid-community/dist/lib/interfaces/iServerSideDatasource";
import { LicenseManager } from  'ag-grid-enterprise'
import CustomFilterConstructor from "./CustomFilterConstructor.vue";
import {useDebounceFn, useElementBounding} from "@vueuse/core";
import {PageActionsInterface} from "../services/page.service";
import {CompiledFunc, compileScript} from "../services/compiler";
import CustomCellRenderer from "./table/CustomCellRenderer.vue";
import _ from "lodash";
import {useStore} from "vuex";
import {useApiClient} from "../services/api.service";

LicenseManager.setLicenseKey("abc")
numeral.locale('ru')

ModuleRegistry.registerModules([ RowGroupingModule, ServerSideRowModelModule ]);

const { t } = useI18n();


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
    context?: any,
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
    filtersVisible?: boolean,
    searchVisible?:boolean,
    customActions?: PageActionConfigInterface[],
    persistingColumnState?: boolean,
    datasourceInst?: DataSourceInterface,
    canSelectAll?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    readonly: false,
    actionButtonsVisible: true,
    infinitiveScroll: false,
    fillHeight: false,
    showCount: false,
    filtersVisible: true,
    searchVisible: true,
    persistingColumnState: true,
    selectAll: false,
    canSelectAll: false,
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

const emit = defineEmits([
    'rowDblClick',
    'rowClick',
    'change',
    'update:modelValue',
    'update:currentId',
    'update:selected'
])

let grid = ref(null)
let gridApi:GridApi  = null
let gridColumnApi:ColumnApi = null
let dsService = useDataSourceService()
let dataSource:DataSourceInterface = null
let searchText = ref('')
let searchVal = ""
let isTree = ref(false)
let _customActions = ref<PageActionsInterface[]>([])
let filtersPopoverVisible = ref(false)
let customFiltersCount = ref(0)
let totalData = ref([])
const store = useStore();
const api = useApiClient()
let context_ = {
}
let permissions = {
    admin: false,
    roles: []
}

watch(() => props.filters?.filters, () => {
    gridApi.refreshServerSide({
        purge: true
    })
} )

watch(() => props.datasource, async () => {
    await init()
    //console.log('datasource')
    gridApi.refreshServerSide({
        purge: true
    })
})

watch(() => props.columns, async () => {
    //console.log('columns')
    await init()
    if (gridApi)
        gridApi.refreshServerSide({
            purge: true
        })
}, {deep: true})

onMounted(async () => {
    permissions = store.getters['auth/account'].permissions
})

function hasPermission(action) {
    if (dataSource) {
        return dataSource.hasPermission(action, permissions)
    }

    return false
}

class GridDataSource implements IServerSideDatasource {

    destroy(): void {
    }

    getRows(params: IServerSideGetRowsParams): void {

        if (!dataSource) {
            console.warn(`Datasource for Table2 doesn't set`)
            console.log(props)
            params.fail()
            return;
        }

        let options: GetDataManyOptions = {
            take: params.request.endRow - params.request.startRow,
            skip: params.request.startRow,
            filter: [],
            fields: props.columns.map(i => i.field),
            route: getRouteToNode(params.parentNode)
        }

        if (params.parentNode) {
            options.parentId = params.parentNode.key
        }

        if (searchText.value) {
            options.search = searchVal
        }

        if (props.filters)
            options.filter.push(...props.filters.filters)

        if (params.request.sortModel.length) {
            options.sort = {
                field: params.request.sortModel[0].colId,
                ask: params.request.sortModel[0].sort === 'asc'
            }
        }

        dataSource.getMany(options).then(res => {
            totalData.value = res.totals

            params.success({
                rowData: res.data,
                rowCount: res.count
            })
        }).catch(e => {
            console.error(e)
            ElMessage.error(`Error while loading data in table: ${e.toString()}`)
            params.fail()
        })

    }
}

const tableBounding = useElementBounding(grid)

function getHeight() {
    if (props.fillHeight) {
        return (props.height ? props.height : 300) - tableBounding.top.value + 50
    }
    return props.height ? props.height : 300
}


function getDataPath(data) {
    //console.log('getDataPath',data)
    return [data.id];
}

let gridComponents = {
    enumCellEditor: EnumCellEditor,
    linkCellEditor: LinkCellEditor,
    datetimeCellEditor: DatetimeCellEditor,
    numberCellEditor: NumberCellEditor,
    treeCellEditor: TreeCellEditor,
    multipleCellRenderer: MultipleCellRenderer,
    customCellRenderer: CustomCellRenderer,
    totalsRenderer: TotalsRenderer
}


const columnDefs = ref<ColDef[]>([]);

let defaultColumnDef = {
    flex: 0,
    resizable: true,
    minWidth: 100,
    sortable: true,
    cellDataType: false
}

let dataTypeDefinitions = {
    number: {
        baseDataType: 'number',
        extendsDataType: 'number',
        valueParser: params => {
            return params.newValue === null ? null : Number(params.newValue)
        },
        valueFormatter: params => {
            let field = dataSource.getFieldByAlias(params.colDef.field)
            if (params.value === undefined || params.value === null || params.value === "")
                return "";

            if (field.config.format && field.config.format !== 'none') {
                return numeral(params.value).format('0,0.' + '0'.repeat(field.config.precision) + (field.config.format === 'currency' ? ' $' : ''))
            }
            return params.value
        },
    },
    date: {
        baseDataType: 'date',
        extendsDataType: 'date',
        valueParser: params => {
            return params.newValue === null ? null : dayjs(params.value)
        },
        valueFormatter: params => {
            return params.value !== null ? dayjs(params.value).format('DD.MM.YYYY') : '';
        },
    },
    datetime: {
        baseDataType: 'date',
        extendsDataType: 'date',
        valueParser: params => {
            return params.newValue === null ? null : dayjs(params.value)
        },
        valueFormatter: params => {
            return params.value !== null ? dayjs(params.value).format('DD.MM.YYYY HH:mm:ss') : '';
        },
    },
    time: {
        baseDataType: 'date',
        extendsDataType: 'date',
        valueParser: params => {
            return params.newValue === null ? null : dayjs(params.value)
        },
        valueFormatter: params => {
            return params.value !== null ? dayjs(params.value).format('HH:mm:ss') : '';
        },
    },
    bool: {
        baseDataType: 'boolean',
        extendsDataType: 'boolean',
    },
    string: {
        baseDataType: 'text',
        extendsDataType: 'text',
    },
    link: {
        baseDataType: 'object',
        extendsDataType: 'object',
        // valueParser: params => {
        //     return null
        // },
        valueFormatter: params => {
            let field = dataSource.getFieldByAlias(params.colDef.field)
            if (field.config.getValue)
                return params.value

            if (!params.value)
                return ''

            if (params.value && params.data[`__${field.alias}_title`]) {
                return params.data[`__${field.alias}_title`]
            }

            return t('notFound')
        }
    },
    enum: {
        baseDataType: 'object',
        extendsDataType: 'object',
        // valueParser: params => {
        //     return null
        // },
        valueFormatter: params => {
            if (params.value === null)
                return ''

            let field = dataSource.getFieldByAlias(params.colDef.field)

            if (field.config.getValue)
                return params.value

            for(const i in field.values) {
                if (field.values[i].key === params.value) {
                    return field.values[i].title
                }
            }
            return t('notFound')
        },
    }
}

const debouncedSearch = useDebounceFn(() => {
    gridApi.refreshServerSide({
        purge: true
    })
}, 200, {maxWait: 1000})

onUnmounted( () => {
    removeListeners()
})

function removeListeners() {
    if (dataSource) {
        dataSource.removeListener('item-inserted', onItemInserted)
        dataSource.removeListener('item-updated', onItemUpdated)
        dataSource.removeListener('totals-updated', onTotalsUpdated)
        dataSource.removeListener('item-removed', onItemRemoved)
        dataSource.removeListener('update', onDataSourceUpdate)
    }
}

function addListeners() {
    if (dataSource) {
        dataSource.on('item-updated', onItemUpdated)
        dataSource.on('totals-updated', onTotalsUpdated)
        dataSource.on('item-inserted', onItemInserted)
        dataSource.on('item-removed', onItemRemoved)
        dataSource.on('update', onDataSourceUpdate)
    }
}

async function addSibling() {
    if (dataSource && !dataSource.hasPermission('Add', permissions)){
        console.error('No permissions for add new row')
        return
    }

    if (actions.value.onAdd) {
        await execAction(actions.value.onAdd)
        return
    }

    if (props.onClickAdd instanceof Function) {
        props.onClickAdd()
        return;
    }

    let selected = gridApi.getSelectedNodes()

    let parentId = null
    if (dataSource.isTree) {
        if (selected.length && selected[0].parent.key) {
            parentId = selected[0].parent.key
        }
    }

    let item = await generateEntityWithDefault(dataSource.fields)
    await dataSource.insert(item.id, item, parentId)
}

async function add() {
    if (dataSource && !dataSource.hasPermission('Add', permissions)){
        console.error('No permissions for add new row')
        return
    }

    if (dataSource.isTree) {
        let selected = gridApi.getSelectedNodes()
        if (!selected.length)
            await addSibling()
        else
            await addChild()
    } else
        await addSibling()
}

async function addChild() {
    if (dataSource && !dataSource.hasPermission('Add', permissions)) {
        console.error('No permissions for add new row')
        return
    }

    if (actions.value.onAdd) {
        await execAction(actions.value.onAdd)
        return
    }

    if (props.onClickAdd instanceof Function) {
        props.onClickAdd()
        return;
    }
    let selected = gridApi.getSelectedNodes()

    let item = await generateEntityWithDefault(dataSource.fields)

    console.log('addChild', item)

    await dataSource.insert(item.id, item, selected.length ? selected[0].id : null, getRouteToNode(selected[0]))


    if (selected.length)
        selected[0].setExpanded(true)
}

function edit() {
    if (dataSource && !dataSource.hasPermission('Edit', permissions)){
        console.error('No permissions for edit row')
        return
    }

    if (actions.value.onEdit) {
        execAction(actions.value.onEdit)
    } else {
        console.log("No action for edit button")
    }
}

function remove() {
    if (dataSource && !dataSource.hasPermission('Remove', permissions)){
        console.error('No permissions for remove row')
        return
    }

    let selected = gridApi.getSelectedNodes()
    if (!selected.length)
        return

    ElMessageBox.confirm(
        t('confirmDeleteTitle'),
        t('delete'),
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    )
        .then(async () => {

            if (actions.value.onRemove) {
                await execAction(actions.value.onRemove)
            } else {

                for (let i in selected) {
                    const data = selected[i]
                    await dataSource.removeById(data.id, getRouteToNode(selected[i]))
                }
            }
        })
}

function getRouteToNode(rowNode) {
    if (!rowNode || !rowNode.parent) {
        return [];
    }

    return [
        ...getRouteToNode(rowNode.parent),
        rowNode.key ? rowNode.key : rowNode.data.id,
    ];
}

function searchChange(e) {
    searchText.value = e
    searchVal = e
    debouncedSearch()
}

async function onGridReady(params) {
    gridApi = params.api;
    gridColumnApi = params.columnApi
    gridApi.setServerSideDatasource(new GridDataSource())

    //console.log('onGridReady')

    //Rebuild the context for passing it to the ag-grid for columns
    context_ = {
        item: props.context.item,
        page: props.context.page,
        //pages: props.context.pages, // this calls a max stack overflow in ag grid
        openDialog: props.context.openDialog
    }

    await init()

}

async function onFirstDataRendered(/*params*/) {
    restoreCols()
}

function getContextMenuItems(/*params: GetContextMenuItemsParams*/) {
    return [{
        name: t('export'),
        subMenu: [{
            name: `${t('exportTo')} .xlsx`,
            action: async () => {
                await exportTo('xlsx')
            },
        }, {
            name: `${t('exportTo')} .csv`,
            action: async () => {
                await exportTo('csv')
            }
        }, {
            name: `${t('exportTo')} .json`,
            action: async () => {
                await exportTo('json')
            }
        }],
    },{
        name: `${t('duplicate')}`,
        action: async () => {
            console.log('duplicate')
        },
    }]
}

async function exportTo(format: 'xlsx' | 'csv' | 'json') {
    let res = await api.post(`/datasources/${dataSource.alias}/data/export`, {
        format: format,
        fields: props.columns.map(item => item.field),
        filter: props.filters?.filters
    })
    if (res.data.success) {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style',"display: none")

        a.href = window.URL.createObjectURL(b64toBlob(res.data.data, `application/${format}`));
        a.download = `${dataSource.alias}.${format}`
        a.click()
    } else {
        console.error(res.data.error)
    }
}

function saveColumnState(e) {
    let sources = [
        "uiColumnMoved",
        "uiColumnSorted",
        "uiColumnResized",
        "contextMenu",
        "toolPanelUi"
    ]
    if (sources.includes(e.source))
        localStorage.setItem(`${props.id}_columns_state`, JSON.stringify(gridColumnApi.getColumnState()))
}

function restoreCols() {
    let state = localStorage.getItem(`${props.id}_columns_state`)
    if (state) {
        gridColumnApi.applyColumnState({
            state: JSON.parse(state),
            applyOrder: true,
        })
    }
}

let isIniting = false

async function init() {
    if (isIniting)
        return

    isIniting = true
    let cols = props.columns || []
    columnDefs.value = []

    //console.log('init')

    if (props.datasourceInst) {
        dataSource = props.datasourceInst
    } else if (props.datasource) {
        dataSource = await dsService.getByAlias(props.datasource)
    }

    if (!dataSource) {
        console.warn(`DataSource ${props.datasource} not found`)
        isIniting = false
        return
    }

    removeListeners()
    addListeners()

    if (dataSource instanceof CustomDataSource) {
        dataSource.setContext(props.context)
    }


    isTree.value = dataSource.isTree

    actions.value.onRowDoubleClick = await compileAction(props.onRowDoubleClick)
    actions.value.onRowClick = await compileAction(props.onRowClick)
    actions.value.onAdd = await compileAction(props.onAdd)
    actions.value.onEdit = await compileAction(props.onEdit)
    actions.value.onRemove = await compileAction(props.onRemove)

    for(let i in cols) {
        let col = cols[i]
        let field = dataSource.getFieldByAlias(col.field)

        if (!field) {
            console.warn('Field for table not found', col.field)
            continue
        }

        let colDef: ColDef = {
            field: col.field,
            sortable: col.sortable,
            headerName: col.title,
            width: col.width,
            minWidth: 60,
            resizable: true,
            editable: isEditable,
            cellDataType: field.type,
            wrapText: col.wordwrap,
            autoHeight: true,
            cellEditorParams: {
                field: field,
                readonly: col.readonly,
            },
            cellRendererSelector: (params) => {
                if (params.node.rowPinned) {
                    return {
                        component: 'totalsRenderer',
                        params: {
                            total: col.total
                        },
                    };
                } else {
                    return undefined;
                }
            }
        }

        if (dataSource.isTree) {
            colDef.cellRendererParams = {
                suppressCount: true
            }
        }

        colDef.cellRendererParams = {}
        if (field.isMultiple) {
            colDef.cellRenderer = 'multipleCellRenderer'
        }

        if (field.config.getValue) {
            colDef.cellRenderer = 'customCellRenderer'
            colDef.cellRendererParams = {
                getValueFunc: compileScript(field.config.getValue, 'ctx')
            }
        }

        colDef.cellRendererParams.field = field

        switch (field.type) {
            case "number":
                colDef.cellEditor = 'numberCellEditor';
                colDef.valueSetter = params => {
                    params.data[field.alias] = params.newValue !== undefined && params.newValue !== null ? Number(params.newValue) : null
                    return true
                }
                break;
            case "date":
            case "time":
            case "datetime":
                colDef.cellEditor = 'datetimeCellEditor';
                colDef.valueSetter = params => {
                    params.data[field.alias] = params.newValue ? new Date(params.newValue).toISOString() : null
                    return true
                }

                break;
            case "enum":
                colDef.cellEditor = 'enumCellEditor';
                break;
            case "link":
                colDef.cellEditor = field.isTree ? 'treeCellEditor' : 'linkCellEditor';

                let datasource = await dsService.getByAlias(field.datasource)

                if (field.datasource && !field.config.getListValues)
                    colDef.cellEditorParams.dataSource = dsService.getByAlias(field.datasource)

                if (field.config.getListValues)
                    colDef.cellEditorParams.getListFunc =  compileScript(_.cloneDeep(field.config.getListValues), 'ctx')

                colDef.valueSetter = params => {
                    if (params.oldValue === params.newValue)
                        return;

                    if (!datasource) {
                        params.data[field.alias] = params.newValue
                        return true
                    }

                    let data = params.data
                    let value = params.newValue

                    if (!value) {

                        data[field.alias] = value
                        if (field.isMultiple) {
                            data[`__${field.alias}_title`] = null
                        } else {
                            data[`__${field.alias}_entities`] = null
                        }
                    } else {
                        let id = field.isMultiple ? value : [value]

                        if (!id.length)
                            return false;

                        data[field.alias] = value
                    }

                    return true
                }

                break;
        }

        if (Number(i) === 0) {

            if (dataSource.isTree) {

                colDef.cellRenderer = 'agGroupCellRenderer'

                colDef.showRowGroup = true
                colDef.cellRendererParams = {
                    checkbox: true,
                    "suppressDoubleClickExpand": true,
                    "suppressEnterExpand": true
                }

                if (field.config.getValue) {
                    colDef.cellRendererParams.innerRenderer = 'customCellRenderer'
                    colDef.cellRendererParams.innerRendererParams = {
                        getValueFunc: field.getValueFunc(),
                        field: field
                    }
                }

            } else {
                colDef.checkboxSelection = true
                colDef.headerCheckboxSelection = !!props.canSelectAll
            }
        }

        columnDefs.value.push(colDef)
    }

    _customActions.value = []
    for(let i in props.customActions) {
        const action = props.customActions[i]

        let compiledFunc: CompiledFunc
        let act = {
            title: action.title,
            type: action.type,
            func: async () => {
                try {
                    await execAction(compiledFunc)
                } catch (e) {
                    //console.error(`Execution error in action "${action.title}"`)
                    //console.error(e);
                }
            }
        }

        try {
            compiledFunc = await compileAction(action.onClick)
            _customActions.value.push(act)
        } catch (e) {
            //console.error(`Compilation error in script for action "${action.title}"`)
            //console.error(e)
        }
    }

    isIniting = false
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
        let selected = gridApi.getServerSideSelectionState().toggledNodes

        ctx.currentId = selected[0]
        ctx.selected = selected
        ctx.selectAll = gridApi.getServerSideSelectionState()['selectAll']
        ctx.filter = props.filters.filters


        ctx.dataSource = dataSource

        action.exec(ctx)
    } catch (e) {
        console.error(`Execution error in action`)
        console.error(e);
    }
}

function isEditable(params) {
    if (dataSource && !dataSource.hasPermission('Edit', permissions))
        return

    if (params.node.rowPinned ||
        dataSource.readonly ||
        props.readonly ||
        params.colDef.cellEditorParams.readonly)
        return false

    if (!params.colDef.cellEditorParams.field || !params.colDef.cellEditorParams.field.config.getReadonly)
        return true

    let fGetReadonly = params.colDef.cellEditorParams.field.getReadonlyFunc()


    if (fGetReadonly) {
        let ctx = Object.assign({}, props.context)

        ctx.row = params.data
        ctx.column = params.column

        let val = fGetReadonly.exec(ctx)
        return !val
    }

    return true
}

function cellValueChanged(params) {
    if (params.newValue === params.oldValue)
        return

    dataSource.setValue(params.data.id, params.colDef.field, params.newValue)
}

function getRowId(params) {
    return params.data.id
}

function getServerSideGroupKey(item) {
    return item.id
}

function isServerSideGroup(item) {
    return item.hasChildren || (item.children && item.children.length)
}

let onItemUpdated = async (params) => {
    //console.log('onItemUpdated', params)
    gridApi.applyServerSideTransaction({
        update: [params.data],
        route: params.route
    })
}

let onTotalsUpdated = async (params) => {
    //console.log('onTotalsUpdated', params)
    totalData.value = params.data
}

let onItemInserted = async (params) => {
    //console.log('item-inserted', params)

    let parent = gridApi.getRowNode(params.data.parentId)

    if (isTree.value && params.route && params.route.length && !parent.data.hasChildren) {
        parent.data.hasChildren = true

        gridApi.applyServerSideTransaction({
            route: params.route.slice(0, params.route.length - 1),
            update: [parent.data],
        });
        return
    }

    gridApi.applyServerSideTransaction({
        add: [params.data],
        route: params.route
    })
}

let onItemRemoved = async (params) => {
    console.log('onItemRemoved', params)
    gridApi.applyServerSideTransaction({
        remove: [params.data],
        route: isTree.value && params.route ? params.route.slice(0, params.route.length - 1) : null
    })
}

let onDataSourceUpdate = async () => {
    //console.log('DataSource updated', dataSource.alias)

    gridApi.refreshServerSide({
        purge: true
    })
}

function cellClicked(params) {
    emit('rowClick', { id: params.node.id })
    if (actions.value.onRowClick) {
        execAction(actions.value.onRowClick, { row: params.node.data })
    }
}

function cellDoubleClicked(params) {
    emit('rowDblClick', { id: params.node.id })

    if (actions.value.onRowDoubleClick) {
        execAction(actions.value.onRowDoubleClick, { row: params.node.data })
    }
}

function selectionChanged() {
    let selected = gridApi.getServerSideSelectionState().toggledNodes
    emit('update:currentId', selected.length ? selected[0] : null)
    emit('update:selected', selected)
}

</script>

<style scoped>

</style>