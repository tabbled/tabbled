<template>
    <div :style="{ height: `${getHeight()}px`, width: '100%'} ">
        <div v-if="actionButtonsVisible" style="padding-bottom: 16px; display: flex;">
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
                        <el-dropdown-item @click="add">{{$t('addSibling')}}</el-dropdown-item>
                        <el-dropdown-item @click="addChild">{{$t('addChild')}}</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
            <el-button v-if="actions.onEdit" @click="edit" size="small">
                {{t('edit')}}
            </el-button>
            <el-button @click="remove" size="small">
                {{t('delete')}}
            </el-button>

            <el-input style="margin-left: 8px; margin-right: 8px"
                      size="small"
                      :id="id"
                      :placeholder="$t('search')"
                      :autofocus="false"
                      @input="searchChange"
                      :model-value="searchText"/>

            <el-input size="small" style="height: 0; width: 0; opacity: 0"/>


            <el-button v-for="action in _customActions"
                       size="small"
                       :type="action.type ? action.type : 'default'"
                       @click="action.func()"
            >
                {{action.title}}
            </el-button>


            <el-popover
                placement="bottom"
                :title="$t('filters.title')"
                :width="400"
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
            @componentStateChanged="onGridColumnsChanged"

        />
    </div>
</template>

<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3";  // the AG Grid Vue Component
import {
    ColDef,
    GridApi,
    ColumnApi,
    ModuleRegistry,
    IServerSideDatasource
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

import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import {IServerSideGetRowsParams} from "ag-grid-community/dist/lib/interfaces/iServerSideDatasource";
import { LicenseManager } from  'ag-grid-enterprise'
import CustomFilterConstructor from "./CustomFilterConstructor.vue";
import {useDebounceFn, useElementBounding} from "@vueuse/core";
import {PageActionsInterface} from "../services/page.service";
import {CompiledFunc, compileScript} from "../services/compiler";
import CustomCellRenderer from "./table/CustomCellRenderer.vue";

LicenseManager.setLicenseKey("abc")

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
    filtersVisible?: boolean,
    customActions?: PageActionConfigInterface[]
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

const emit = defineEmits(['rowDblClick', 'rowClick', 'change', 'update:modelValue', 'update:currentId'])

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

watch(() => props.filters?.filters, () => gridApi.refreshServerSide({
    purge: true
}))

watch(() => props.datasource, async () => {
    await init()
    gridApi.refreshServerSide({
        purge: true
    })
})

onMounted(() => {
})

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
    console.log('getDataPath',data)
    return [data.id];
}

let gridComponents = {
    enumCellEditor: EnumCellEditor,
    linkCellEditor: LinkCellEditor,
    datetimeCellEditor: DatetimeCellEditor,
    numberCellEditor: NumberCellEditor,
    treeCellEditor: TreeCellEditor,
    multipleCellRenderer: MultipleCellRenderer,
    customCellRenderer: CustomCellRenderer
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
                return Number.parseFloat(Number(params.value).toFixed(field.config.precision)).toLocaleString('ru-RU')
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
    if (dataSource) {
        dataSource.removeListener('item-inserted', onItemInserted)
        dataSource.removeListener('item-updated', onItemUpdated)
        dataSource.removeListener('item-removed', onItemRemoved)
        dataSource.removeListener('update', onDataSourceUpdate)
    }
})

async function add() {
    if (dataSource.isTree) {
        await addChild()
        return;
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
    if (selected.length && selected[0].parent.key) {
        parentId = selected[0].parent.key
    }

    let item = await generateEntityWithDefault(dataSource.fields)
    await dataSource.insert(item.id, item, parentId)
}

async function addChild() {

    if (actions.value.onAdd) {
        await execAction(actions.value.onAdd)
        return
    }

    if (props.onClickAdd instanceof Function) {
        props.onClickAdd()
        return;
    }
    console.log('insert')
    let selected = gridApi.getSelectedNodes()

    let item = await generateEntityWithDefault(dataSource.fields)

    await dataSource.insert(item.id, item, selected.length ? selected[0].id : null, getRouteToNode(selected[0]))


    if (selected.length)
        selected[0].setExpanded(true)
}

function edit() {
    if (actions.value.onEdit) {
        execAction(actions.value.onEdit)
    } else {
        console.log("No action for edit button")
    }
}

function remove() {
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
                    // if (await dataSource.removeById(data.id)) {
                    //
                    //     console.log(selected[i])
                    //
                    //     if (isTree.value) {
                    //         let route = getRouteToNode(selected[i])
                    //
                    //         gridApi.refreshServerSide({
                    //             route: route.slice(0, route.length - 1),
                    //             purge: true
                    //         })
                    //     } else {
                    //         gridApi.applyServerSideTransaction({
                    //             remove: [data.id]
                    //         })
                    //     }
                    //
                    // }
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
    //console.log('onGridReady')
    gridApi = params.api;
    gridColumnApi = params.columnApi
    gridApi.setServerSideDatasource(new GridDataSource())

    await init()
}

function saveColumnState() {
    localStorage.setItem(`${props.id}_columns_state`, JSON.stringify(gridColumnApi.getColumnState()))
}


async function init() {
    let cols = props.columns || []
    columnDefs.value = []

    if (props.datasource) {
        dataSource = await dsService.getByAlias(props.datasource)

        if (!dataSource) {
            console.warn(`DataSource ${props.datasource} not found`)
            return
        }

        if (dataSource instanceof CustomDataSource) {
            dataSource.setContext(props.context)
        }
    }

    isTree.value = dataSource.isTree

    actions.value.onRowDoubleClick = await compileAction(props.onRowDoubleClick)
    actions.value.onRowClick = await compileAction(props.onRowClick)
    actions.value.onAdd = await compileAction(props.onAdd)
    actions.value.onEdit = await compileAction(props.onEdit)
    actions.value.onRemove = await compileAction(props.onRemove)

    dataSource.on('item-updated', onItemUpdated)
    dataSource.on('item-inserted', onItemInserted)
    dataSource.on('item-removed', onItemRemoved)
    dataSource.on('update', onDataSourceUpdate)

    for(let i in cols) {
        let col = cols[i]
        let field = dataSource.getFieldByAlias(col.field)
        let colDef: ColDef = {
            field: col.field,
            sortable: col.sortable,
            headerName: col.title,
            width: col.width,
            resizable: true,
            editable: isEditable,
            cellDataType: field.type,
            wrapText: col.wordwrap,
            autoHeight: true,
            cellEditorParams: {
                field: field,
                context: props.context,
                readonly: col.readonly,
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
                getValueFunc: field.getValueFunc()
            }
        }

        colDef.cellRendererParams.field = field
        colDef.cellRendererParams.context = props.context

        switch (field.type) {
            case "number":
                colDef.cellEditor = 'numberCellEditor';
                colDef.valueSetter = params => {
                    params.data[field.alias] = params.newValue ? Number(params.newValue) : null
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

                colDef.cellEditorParams.dataSource = datasource

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
                            return;

                        let displayProp = field.displayProp ? field.displayProp : 'name'

                        datasource.getMany({
                            id: id,
                            fields: [displayProp]
                        }).then(res => {

                            if (field.isMultiple) {
                                data[`__${field.alias}_entities`] = res.data
                            } else {
                                data[`__${field.alias}_title`] = res.data[0][displayProp]
                            }

                            data[field.alias] = value
                            params.node.setData(data)
                            dataSource.setValue(data.id, field.alias, value)

                            console.log(data)

                        }).catch(e => {
                            console.error(e)

                            //return value to old
                            data[field.alias] = params.oldValue
                            params.node.setData(data)
                        })
                    }

                    data[field.alias] = null //this for that grid will recofnize changes after loading new data from server
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
                    context: props.context,
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
            }
        }

        columnDefs.value.push(colDef)
    }

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
        let selected = gridApi.getSelectedNodes()
        if (selected.length) {
            ctx.currentId = selected[0].data.id
            ctx.currentItem = selected[0].data
        }

        ctx.dataSource = dataSource

        action.exec(ctx)
    } catch (e) {
        console.error(`Execution error in action`)
        console.error(e);
    }
}

function isEditable(params) {
    if (dataSource.readonly ||
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
    gridApi.applyServerSideTransaction({
        update: [params.data],
        route: params.route
    })
}

let onItemInserted = async (params) => {
    //console.log('item-inserted', params)

    let parent = gridApi.getRowNode(params.data.parentId)

    console.log(params)

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
    emit('update:currentId', gridApi.getSelectedRows()[0]?.id)

}

function onGridColumnsChanged() {
    //console.log('componentStateChanged')
    restoreCols()
}

</script>

<style scoped>

</style>