<template>

    <div style="display: flex; flex-flow: row; padding: 16px; height: calc(100% - 32px)"
         @mouseup="endResizeSettingPanel"
         @mousemove="onResizeSettingPanel">

        <div style="padding-bottom: 16px; display: flex; flex-flow: column;">

            <div  style="display: flex; flex-flow: wrap; justify-content: space-between">
                <div style="display: flex; flex-flow: wrap; align-items: center">
                    <el-radio-group v-model="selectedSize" size="small">
                        <el-radio-button v-for="i in getAvailableScreenSizes($t)" :label="i.size">{{i.title}} </el-radio-button>
                    </el-radio-group>
                    <el-divider direction="vertical"/>
                    <el-dropdown type="default"
                                 size="small"
                                 trigger="click"
                    >
                        <el-button size="small">
                            {{$t('pageDesigner.addElement')}}
                            <Icon icon="mdi:chevron-down" style="padding-left: 4px"></Icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="(comp) in componentService.getList()"
                                                  @dragstart="(e) => startDragNewElement(e, comp)"
                                                  draggable="true"
                                                  style="cursor: move"
                                >
                                    <Icon :icon="comp.icon" style="padding-right: 4px"/>
                                    {{comp.title}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <div style="display: flex; flex-flow: wrap; align-items: center;">
                        <el-button size="small" link @click="selectWidget('')" style="padding-left: 8px">
                            <Icon icon="mdi:cog" width="16" style="padding-right: 4px"/>
                            {{$t('pageDesigner.pageSettings')}}
                        </el-button>

                    </div>
                </div>


                <div style="margin-right: 16px">
                    <el-button size="small" @click="cancel">{{$t('cancel')}}</el-button>
                    <el-button size="small" type="primary" @click="save" :disabled="!isChanged">{{$t('save')}}</el-button>
                </div>
            </div>



            <div style="display: flex; flex-flow: row">

                <div style="display: flex; flex-flow: column; width: 100%" >



                    <el-page-header ref="mainHeader" class="page-header" @back="$router.back()">
                        <template #content>
                            <span class="text-large font-600 mr-3"> {{pageConfig ? pageConfig.title : ""}} </span>
                        </template>

                        <template #extra>
                            <div class="page-header-action-panel">
                                <el-button v-for="action in pageHeader.actions"
                                           :type="action.type ? action.type : 'default'"
                                           @click="action.func()"
                                >
                                    {{action.title}}
                                </el-button>
                                <el-button v-if="pageConfig ? pageConfig.isEditPage : false" disabled>{{$t('cancel')}}</el-button>
                                <el-button v-if="pageConfig ? pageConfig.isEditPage : false" type="primary" disabled>{{$t('save')}}</el-button>
                            </div>
                        </template>
                    </el-page-header>

                    <el-form label-position="top">
                        <div ref="grid"
                             class="grid-wrapper"
                             @mouseup="endDrag"
                             @mousemove="onDrag"
                             @dragover.prevent
                             @dragenter.prevent
                             @drop="dropNewWidget($event)"
                             @click="gridClicked"
                        >
                            <div v-for="(element, idx) in elements"
                                 class="dragging widget-draggable"
                                 :id="String(idx)"
                                 :style="getGridElStyle(element)"
                                 :class="{'prevent-select': true, 'widget-selected': selectedIdx === String(idx)}">


                                <el-form-item
                                    :id="String(idx)"

                                >
                                    <template #label>
                                        <div
                                            style="cursor: move; width: 100%; height: 100%; margin: 0 !important; padding: 0 !important;" @mousedown="initDragMove"
                                            :id="String(idx)">
                                            <span :id="String(idx)">{{getElementTitle(element)}}</span>
                                            <div @click="removeWidget(Number(idx))">
                                                <Icon :id="String(idx)" icon="mdi:delete" class="delete-icon"/>
                                            </div>
                                        </div>
                                    </template>

                                    <component
                                        :id="String(idx)"
                                        style="width: 100%"
                                        v-bind="getElementProperties(element)"
                                        :is="element.name"
                                    />
                                </el-form-item>

                                <div :class="{
                            'resizer-right': true,
                            'resizer-activated': (dragDirection === 'right' && dragIdx === String(idx))}"
                                     @mousedown="initDragRight" :id="String(idx)"></div>
                                <div :class="{
                            'resizer-bottom': true,
                            'resizer-activated': (dragDirection === 'bottom' && dragIdx === String(idx))}"
                                     @mousedown="initDragBottom" :id="String(idx)"></div>
                            </div>
                        </div>
                    </el-form>
                </div>





            </div>

        </div>


        <el-aside
            style="overflow: hidden;"
            :width="String(settingPanelWidth) + 'px'">

            <div class="resizer"
                 @mousedown="initResizeSettingPanel"/>

            <PageSettingsPanel
                :page-config="pageConfig"
                :current-path="currentConfigPath"
                @path-changed="v => currentConfigPath = v"
                @update="onUpdateProperty"
            />

        </el-aside>
    </div>


</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from "vue";
import {
    ComponentInterface,
    ElementInterface,
    getAvailableScreenSizes,
    PageConfigInterface,
    PositionElementInterface,
    ScreenSize
} from "../model/page";
import {useRoute, useRouter} from "vue-router";
import {useDataSourceService} from "../services/datasource.service";
import {usePageHeader} from "../services/page.service";
import _ from 'lodash'
import {ComponentTitle, useComponentService} from "../services/component.service";
import {ElMessage} from "element-plus";
import {Icon} from "@iconify/vue";
import PageSettingsPanel from '../components/PageSettingsPanel.vue'
import { FlakeId } from '../flake-id'
import {useSettings} from "../services/settings.service";
let flakeId = new FlakeId()

interface ComponentDropInterface extends ComponentInterface {
    layerX: number,
    layerY: number
}

const props = defineProps<{
    screenSize: ScreenSize
}>()

let route = useRoute()
let router = useRouter()
let dsService = useDataSourceService()
let componentService = useComponentService()

let elements = ref<ElementInterface[]>([])
let pageConfig = ref<PageConfigInterface>(null)

let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let widget: PositionElementInterface | null = null
let initWidget: PositionElementInterface | null = null
let dragDirection = ref("");
let dragIdx = ref("")
let selectedIdx = ref("")
let selectedSize = ref(ScreenSize.desktop)
let currentConfigPath = ref('')
let settingPanelWidth = ref<number>(getSettingsPanelWidth())
let isResizingSettingPanel = false
let startXResizingSettingPanel = 0

let isChanged = ref(false)
const settings = useSettings()

const grid = ref(null);

let pageHeader = usePageHeader()

onMounted(async () => {
    try {
        await init()
        setAppTitle()
    } catch (e) {
        console.error(e)
    }
})

onUnmounted(() => {
    // pageHeader.actions = []
    // pageHeader.title = ""
})

function setAppTitle() {
    document.title = `${route.meta.title} | ${ settings.title }`
}

function getSettingsPanelWidth():number {
    let w = localStorage.getItem('settings_panel_width')
    return w ? Number(w) : 300
}

function initResizeSettingPanel(e:MouseEvent) {
    isResizingSettingPanel = true;

    startXResizingSettingPanel = e.clientX
}

function endResizeSettingPanel() {
    isResizingSettingPanel = false
}

function onResizeSettingPanel(e: MouseEvent) {
    if (!isResizingSettingPanel) {
        return;
    }

    settingPanelWidth.value += startXResizingSettingPanel - e.clientX
    startXResizingSettingPanel = e.clientX

    localStorage.setItem('settings_panel_width', String(settingPanelWidth.value))

    //handleResize()
}

function getElementProperties(element: ElementInterface) {
    let component = componentService.getByName(element.name)
    if (!component)
        return undefined

    let props:any = {}
    props.context = {}

    //Replace properties with type dataset/datasource/etc to ref
    component.properties.forEach(prop => {
        props[prop.alias] = _.cloneDeep(element[prop.alias])

        if(props[prop.alias] === undefined) {
            props[prop.alias] = _.cloneDeep(prop.default)
        }
    })
    return props;

}

async function init() {
    if (!route.params.id) {
        console.error("Id not provided in url params")
        return;
    }

    if (route.params.id === 'new') {
        // TODO need to use generateEntityWithDefault(...)
        pageConfig.value = {
            id: null,
            alias: '',
            path: '',
            title: '',
            elements: [],
            onOpen: null,
            headerActions: [],
            isEditPage: false
        }
    } else {
        pageConfig.value = await getPageConfig(route.params.id.toString())
    }


    if (!pageConfig.value) {
        router.back()
        console.error(`Page with id ${route.params.id} not found`)
        return;
    }

    pageHeader.title = `Page designer #` + pageConfig.value.alias

    pageHeader.actions = []
    // pageHeader.actions.push({
    //     title: 'Cancel',
    //     type: 'default',
    //     func: () => { console.log('cancel') }
    // })
    // pageHeader.actions.push({
    //     title: 'Save',
    //     type: 'primary',
    //     func: () => { console.log('save') }
    // })

    elements.value = []

    elements.value = pageConfig.value.elements
    currentConfigPath.value = ''

    selectWidget("")

    isChanged.value = false
}

async function onUpdateProperty(path: string, value: any) {
    _.update(pageConfig.value, path, () => {
        return value
    })

    isChanged.value = true
}

async function save() {
    let ds = dsService.pageDataSource

    //gather changes from elements to config after saving
    pageConfig.value.elements = elements.value

    try {
        if (pageConfig.value.id === null) {
            let id = (await flakeId.generateId()).toString()
            pageConfig.value.id = id
            await ds.insert(id, pageConfig.value)
        } else {
            await ds.updateById(pageConfig.value.id, pageConfig.value)
        }

        ElMessage.success('Saved successfully')
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function cancel() {
    router.back();
}

async function getPageConfig(id: string):Promise<PageConfigInterface | undefined> {
    let ds = dsService.pageDataSource
    let config = await ds.getById(id);
    return config ? <PageConfigInterface>config : undefined
}

function gridClicked(e:MouseEvent) {
    // @ts-ignore
    selectWidget(e.target?.id)
}

function initDragMove(e:MouseEvent) {
    dragDirection.value = 'move'
    initDrag(e)
}

function initDragRight(e:MouseEvent) {
    dragDirection.value = 'right'
    initDrag(e)
}

function initDragBottom(e:MouseEvent) {
    dragDirection.value = 'bottom'
    initDrag(e)
}

function selectWidget(id: string) {
    selectedIdx.value = id
    currentConfigPath.value = id !== "" ? `elements[${id}]` : ``
}

function getElementTitle(el) {
    if (!el.title || el.title === '') {
        return el.name
    }
    return el.title
}

function removeWidget(idx: number) {
    elements.value.splice(idx, 1);
    isChanged.value = true
}

function initDrag(e:MouseEvent) {

    startX = e.clientX;
    startY = e.clientY;

    // @ts-ignore
    let widgetElement = e.target.parentNode
    // @ts-ignore
    dragIdx.value = Number(e.target.id)

    startWidth = widgetElement.offsetWidth;
    startHeight = widgetElement.offsetHeight;


    widget = elements.value[dragIdx.value].layout[selectedSize.value]

    // If position for that size not found then copy from any existed
    if (!widget) {
        let layout = elements.value[dragIdx.value].layout
        layout[selectedSize.value] = _.cloneDeep(layout[ScreenSize.desktop] || layout[ScreenSize.mobile])
        widget = layout[selectedSize.value]
    }

    initWidget = _.cloneDeep(widget)
}

function onDrag(e: MouseEvent) {
    if (!widget) {
        return;
    }

    if (dragDirection.value == 'right') {
        let colW = ( grid?.value?.offsetWidth / 12 );
        let colspan = Math.round((e.clientX - startX -26)  / colW)
        let cTo = initWidget.colTo + colspan + 1
        widget.colTo =  cTo <= 13 ? initWidget.colTo + colspan + 1 : 13;
    }

    if (dragDirection.value == 'bottom') {
        let rowW = 70
        let rowspan = Math.round((e.clientY - startY - 20)  / rowW)
        widget.rowTo = initWidget.rowTo + rowspan;
    }

    if (dragDirection.value == 'move') {
        let colW = ( grid?.value?.offsetWidth / 12 );
        let colspan = Math.round((e.clientX - startX)  / colW)
        let cTo = initWidget.colTo + colspan
        let cFrom = initWidget.colFrom + colspan

        if (cTo <= 13 && cFrom >= 1) {
            widget.colFrom =  initWidget.colFrom + colspan;
            widget.colTo =  initWidget.colTo + colspan;
        }

        let rowW = 70
        let rowspan = Math.round((e.clientY - startY)  / rowW)

        if ((initWidget.rowFrom + rowspan) >= 1) {
            widget.rowFrom = initWidget.rowFrom + rowspan;
            widget.rowTo = initWidget.rowTo + rowspan;
        }
    }
    isChanged.value = true
}

function endDrag() {
    widget = null;
    dragDirection.value = ""
}

function getGridElStyle(element:ElementInterface) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: 'auto'
    }

    let el = element.layout[selectedSize.value] || element.layout[ScreenSize.desktop]

    if (el.colFrom) {
        let c = String(el.colFrom);
        if (el.colTo) c += ' / ' + el.colTo;
        style.gridColumn = c;
    }
    if (el.rowFrom) {
        let r = String(el.rowFrom);
        if (el.rowTo) r += ' / ' + el.rowTo;
        style.gridRow = r;
    }
    return style;
}

function startDragNewElement(e:any, item: ComponentTitle) {
    let it = Object.assign({
        layerX: e.layerX,
        layerY: e.layerY
    }, item)
    e.dataTransfer?.setData('item', JSON.stringify(it))
}

async function dropNewWidget(e:DragEvent) {
    let item = <ComponentDropInterface>JSON.parse(e.dataTransfer.getData('item'));
    let comp = componentService.getByName(item.name);

    let relatedX = e.offsetX
    let relatedY = e.offsetY
    let grid = e.target
    // @ts-ignore
    let colWidth = grid?.clientWidth / 12

    let startCol = Math.round((relatedX - item.layerX)  / colWidth)
    let startRow = Math.round((relatedY - item.layerY)  / 80)


    startCol = startCol >= 1 ? startCol : 1
    let endCol = startCol + comp.defaultPosition.cols;
    if (endCol > 13) {
        endCol = 13
        startCol = endCol - comp.defaultPosition.cols
    }
    startRow = startRow >= 1 ? startRow : 1

    let properties = {}
    comp.properties.forEach(prop => {
        let val:any = null
        switch (prop.type) {
            case "bool": val = prop.default ? prop.default : false; break;
            case "string": val = prop.default ? prop.default : ""; break;
            case "number": val = prop.default ? prop.default : 0; break;
            case "list":
            case "table": val = []; break;
            default: prop.default ? prop.default : null;
        }
        properties[prop.alias] = val
    })

    elements.value.push({
        id: (await flakeId.generateId()).toString(),
        name: comp.name,
        field: '',
        layout: {
            [ScreenSize.desktop]: {
                colFrom: startCol,
                colTo: endCol,
                rowFrom: startRow,
                rowTo: startRow + comp.defaultPosition.rows,
            },
            [ScreenSize.mobile]: {
                colFrom: startCol,
                colTo: endCol,
                rowFrom: startRow,
                rowTo: startRow + comp.defaultPosition.rows,
            }
        },
        props: properties
    })
    isChanged.value = true;
}

</script>

<style lang="scss">


.grid-wrapper {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(10, 64px) min(64px);
    gap: 10px;
    grid-auto-rows: minmax(40px, auto);
    padding-right: 16px;
}

.settings-panel{
    display: flex;
    flex-flow: row;
    padding-left: 16px;
    justify-content: space-between;
}

.setting-panel {
    width: 216px;
    background: white;
    padding-left: 16px;
    position: absolute;
}

.setting-panel-trans-enter-active {
    transition: all 0.3s
}

.setting-panel-trans-leave-active {
    transition: all 0.3s;
}

.setting-panel-trans-enter-from,
.setting-panel-trans-leave-to {
    transform: translateX(250px);
}

.setting-panel-divider {
    position: absolute !important;
    bottom: 0;
    top:0;
    left: 0;
    height: inherit !important;
    padding: 0 !important;
    margin: 0 !important;
}

.grid-wrapper .el-form-item__label {
    padding: 0 3px 0 0;
}

.widget-draggable {
    position: relative;
    z-index: 1;
    opacity: 1;
    border: var(--el-border-color-lighter) dashed 1px;
    border-radius: 4px;
    margin: 0 !important;
    padding: 0 !important;
    cursor: move;
    overflow: hidden;
}

.new-widget-draggable {
    cursor: move;
    height: auto;
    margin-bottom: 8px;
}

.widget-selected {
    background: var(--el-color-primary-light-9);
    outline: var(--el-color-primary-light-3) solid 1px;
}

.dragging-icon {
    width: 30px;
    height: 30px;
    padding-right: 4px;
    position: absolute;
    color: var(--el-menu-border-color);
    cursor: move;
    z-index: 0;
}

.delete-icon {
    color: transparent;
    position: absolute;
    top:5px;
    right: 5px;
    z-index: 101;
    cursor: default;
}

.resizer-right {
    width: 3px;
    background: transparent;
    position: absolute;
    right: -2px;
    bottom: 1px;
    top: 1px;
    cursor: ew-resize;
    z-index: 20;
}

.resizer-bottom {
    height: 3px;
    background: transparent;
    position: absolute;
    right: 1px;
    left: 1px;
    bottom: -2px;
    cursor: ns-resize;
    z-index: 20;
}


.widget-draggable:hover .delete-icon {
    color: var(--el-color-info);
}

.delete-icon:hover {
    color: var(--el-color-danger);
}

.widget-draggable:hover {
    background: var(--el-color-primary-light-9);
}

.resizer-bottom:hover {
    background: var(--el-color-primary-light-3);
    opacity: 0.5;
}

.resizer-right:hover {
    background: var(--el-color-primary-light-3);
    opacity: 0.5;
}

.resizer-activated {
    background: var(--el-color-primary-light-3);
}


.prevent-select {
    -webkit-user-select: none;  /* Safari */
    -ms-user-select: none;      /* IE 10 and IE 11 */
    user-select: none;          /* Standard syntax */
}


.resizer {
    position: absolute;
    top:0;
    bottom: 0;
    width: 5px;
    z-index: 11;
    cursor: col-resize;
    border-left-color: var(--el-border-color-lighter) ;
    border-left-width: 1px;
    border-left-style: solid;
}


.resizer:hover {
    border-left-color: var(--el-border-color-dark);
    border-left-width: 1px;
    border-left-style: solid;
}



</style>