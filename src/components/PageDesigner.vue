<template>
    <el-row>
        <el-col :span="16">
            <el-row align="middle" style="padding-bottom: 16px">
                <div></div>
                <el-radio-group v-model="selectedSize" size="small">
                    <el-radio-button v-for="i in getAvailableScreenSizes($t)" :label="i.size">{{i.title}} </el-radio-button>
                </el-radio-group>
            </el-row>
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
                     :id="String(idx)"
                     :style="getGridElStyle(element)"

                >
                    <div :class="{'widget-draggable': true, 'prevent-select': true}"
                         style="height: inherit"
                         :id="String(idx)"
                    >
                        <WidgetElement :properties="getElementProperties(element)"
                                       style="height: inherit;"
                                       :component="element.name"
                                       :class="{'widget-selected': selectedIdx === String(idx)}"
                        />
                        <div :class="{
                        'resizer-right': true,
                        'resizer-activated': (dragDirection === 'right' && dragIdx === String(idx))}"
                             @mousedown="initDragRight" :id="String(idx)"></div>
                        <div :class="{
                        'resizer-bottom': true,
                        'resizer-activated': (dragDirection === 'bottom' && dragIdx === String(idx))}"
                             @mousedown="initDragBottom" :id="String(idx)"></div>
                        <div class="dragging" @mousedown="initDragMove" :id="String(idx)" />

                        <div @click="removeWidget(Number(idx))">
                        <span class="iconify delete-icon" :id="String(idx)"
                              data-icon="mdi:delete"
                        />
                        </div>

                    </div>

                </div>

            </div>

        </el-col>
        <el-col :span="8">

            <ElementSettingPanel
                class="element-setting-panel"
                :properties="activeComponentProperties"
                :model="selectedIdx ? elements[Number(selectedIdx)].properties : pageConfig"
                @update="onUpdateProperty" />
        </el-col>

    </el-row>

</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, ComputedRef, computed} from "vue";
import WidgetElement from "./WidgetElement.vue"
import {
    ElementInterface,
    getAvailableScreenSizes,
    PageConfigInterface,
    PositionElementInterface,
    ScreenSize
} from "../model/page";
import ElementSettingPanel from "./ElementSettingPanel.vue"
import {useRoute, useRouter} from "vue-router";
import {useDataSourceService} from "../services/datasource.service";
import {usePageHeader} from "../services/page.service";
import _ from 'lodash'
import {DataSet, useDataSet} from "../model/dataset";
import {FieldConfigInterface} from "../model/field";
import {useComponentService} from "../services/component.service";

let pageProperties:FieldConfigInterface[]  = [
    {
        title: 'Title',
        alias: 'title',
        type: "string",
        required: true
    },
    {
        title: 'Path',
        alias: 'path',
        type: "string",
        required: true
    },
    {
        title: 'Alias',
        alias: 'alias',
        type: "string",
        required: true
    }
]

const props = defineProps<{
    screenSize: ScreenSize
}>()

let route = useRoute()
let router = useRouter()
let dsService = useDataSourceService()
let componentService = useComponentService()

let elements = ref<ElementInterface[]>([])
let dataSets = ref<Map<string, DataSet>>(new Map())
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

const grid = ref(null);

let pageHeader = usePageHeader()

onMounted(() => {
    init()
})

onUnmounted(() => {
    pageHeader.actions = []
    pageHeader.title = ""
})

function getElementProperties(element: ElementInterface) {
    console.log('getElementProperties', element)
    let component = componentService.getByName(element.name)
    if (!component)
        return undefined

    let props:any = {}
    props.context = {}

    //Replace properties with type dataset/datasource/etc to ref
    component.properties.forEach(prop => {
        props[prop.alias] = _.cloneDeep(element.properties[prop.alias])

        if(props[prop.alias] === undefined) {
            console.log(prop)
            props[prop.alias] = _.cloneDeep(prop.default)
        }

        if (prop.type === 'dataset') {
            props[prop.alias] = dataSets.value.get(element.properties[prop.alias])
        }
    })
    console.log(props)
    return props;

}

const activeComponentProperties: ComputedRef<FieldConfigInterface[]> = computed((): FieldConfigInterface[] =>  {
    if (!selectedIdx.value)
        return pageProperties;

    let el = elements.value[Number(selectedIdx.value)]

    //console.log(componentService.getList())

    let component = componentService.getByName(el.name)
    if (!component) {
        console.warn(`Component "${el.name}" not registered`)
        return []
    }
    return component.properties
})



async function init() {
    if (!route.params.id) {
        console.error("Id not provided in url params")
        return;
    }
    pageConfig.value = await getPageConfig(route.params.id.toString())

    if (!pageConfig.value) {
        router.back()
        console.error(`Page with id ${route.params.id} not found`)
        return;
    }

    pageHeader.title = `Page designer #` + pageConfig.value.alias

    //elements.value = pageConfig.value.elements

    pageHeader.actions = []
    pageHeader.actions.push({
        title: 'Cancel',
        type: 'default',
        func: cancel
    })
    pageHeader.actions.push({
        title: 'Save',
        type: 'primary',
        func: save
    })

    elements.value = []
    dataSets.value.clear();

    pageConfig.value.dataSets.forEach(config => {
        let ds = useDataSet(config)
        dataSets.value.set(ds.alias, ds)
        //scriptContext.dataSets[ds.alias] = ds
    })

    elements.value = pageConfig.value.elements

    // pageConfig.value.elements.forEach(element => {
    //     let el:ElementInterface = {
    //         layout: element.layout,
    //         name: element.name,
    //         properties: {}
    //     }
    //
    //     Object.keys(element.properties).forEach(key => {
    //         if (key === 'dataSet') {
    //             if (element.properties.dataSet && element.properties.dataSet !== "") {
    //                 if (!dataSets.value.has(element.properties.dataSet)) {
    //                     console.warn(`DataSet "${element.properties.dataSet}" does not exist!`)
    //                 } else {
    //                     el.properties.dataSet = dataSets.value.get(element.properties.dataSet)
    //                 }
    //             }
    //         } else {
    //             el.properties[key] = _.cloneDeep(element.properties[key])
    //         }
    //     })
    //     el.properties['context'] = {}
    //     elements.value.push(el)
    // })
}

async function onUpdateProperty(alias: string, value: any) {
    //console.log(alias, value)
    if (!selectedIdx.value) {
        pageConfig.value[alias] = value
    } else {
        console.log(value)
        elements.value[selectedIdx.value].properties[alias] = value
        console.log(elements.value[selectedIdx.value])
    }

}

async function save() {
    dsService.getDataSourceByAlias('page')
    let ds = dsService.getDataSourceByAlias('page')

    //gather changes from elements to config after saving
    pageConfig.value.elements = elements.value

    console.log(pageConfig.value.elements)

    try {
        await ds.updateById(pageConfig.value.id, pageConfig.value)
    } catch (e) {
        console.error(e)
    }
}

async function cancel() {
    router.back();
}

async function getPageConfig(id: string):Promise<PageConfigInterface | undefined> {
    let ds = dsService.getDataSourceByAlias('page')
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
}

function removeWidget(idx: number) {
    elements.value.splice(idx, 1);
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
        let colspan = Math.round((e.clientX - startX -40)  / colW)
        let cTo = initWidget.colTo + colspan + 1
        widget.colTo =  cTo <= 13 ? initWidget.colTo + colspan + 1 : 13;
    }

    if (dragDirection.value == 'bottom') {
        let rowW = 40
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

        let rowW = 50
        let rowspan = Math.round((e.clientY - startY)  / rowW)

        if ((initWidget.rowFrom + rowspan) >= 1) {
            widget.rowFrom = initWidget.rowFrom + rowspan;
            widget.rowTo = initWidget.rowTo + rowspan;
        }

    }
}

function endDrag() {
    widget = null;
    dragDirection.value = ""
}

function getGridElStyle(element:ElementInterface) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: '100%'
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

// function startDragNewWidget(e:any, item: any) {
//     let it = Object.assign({
//         layerX: e.layerX,
//         layerY: e.layerY
//     }, item)
//     e.dataTransfer?.setData('item', JSON.stringify(it))
// }

function dropNewWidget(e:DragEvent) {
    let item = JSON.parse(e.dataTransfer.getData('item'));

    let relatedX = e.offsetX
    let relatedY = e.offsetY
    let grid = e.target
    // @ts-ignore
    let colWidth = grid?.clientWidth / 12

    let startCol = Math.round((relatedX - item.layerX)  / colWidth)
    let startRow = Math.round((relatedY - item.layerY)  / 35)


    startCol = startCol >= 1 ? startCol : 1
    let endCol = startCol + item.defaultCols;
    if (endCol > 13) {
        endCol = 13
        startCol = endCol - item.defaultCols
    }
    startRow = startRow >= 1 ? startRow : 1

    elements.value.push({
        name: "",
        layout: {
            [ScreenSize.desktop]: {
                colFrom: startCol,
                colTo: endCol,
                rowFrom: startRow,
                rowTo: startRow + item.defaultRows,
            },
            [ScreenSize.mobile]: {
                colFrom: startCol,
                colTo: endCol,
                rowFrom: startRow,
                rowTo: startRow + item.defaultRows,
            }
        },
        properties: {
        }
    })
}

</script>

<style lang="scss">

.grid-wrapper {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(10, 40px) min(40px);
    gap: 10px;
    grid-auto-rows: minmax(40px, auto);
}

.setting-panel {
    width: 216px;
    background: white;
    padding-left: 16px;
}

.element-setting-panel {
    height: 100%;
    z-index: 10;
    opacity: 100;
    padding-left: 16px;
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



.widget-draggable {
    position: relative;
    z-index: 1;
}

.new-widget-draggable {
    cursor: move;
    height: auto;
    margin-bottom: 8px;
}

.widget-selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-3);
}

.widget-draggable .dragging {
    position: absolute;
    left: 5px;
    top: 5px;
    bottom: 5px;
    right: 5px;
    cursor: move;
    z-index: 2;
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
    top:10px;
    right: 10px;
    z-index: 10;
}

//  For disable clicking on widget
// pointer-events: none;

.widget-draggable .resizer-right {
    width: 3px;
    background: transparent;
    position: absolute;
    right: -2px;
    bottom: 2px;
    top: 2px;
    cursor: ew-resize;
    z-index: 2;
}

.widget-draggable .resizer-bottom {
    height: 3px;
    background: transparent;
    position: absolute;
    right: 2px;
    left: 2px;
    bottom: -2px;
    cursor: ns-resize;
    z-index: 2;
}



.widget-draggable:hover .delete-icon {
    color: var(--el-color-info);
}

.delete-icon:hover {
    color: var(--el-color-danger);
}

.widget-draggable:active {
    background: var(--el-color-primary-light-8);
}

.widget-draggable .resizer-bottom:hover {
    background: var(--el-color-primary-light-3);
}

.widget-draggable .resizer-right:hover {
    background: var(--el-color-primary-light-3);
}

.widget-draggable .resizer-activated {
    background: var(--el-color-primary-light-3);
}


.prevent-select {
    -webkit-user-select: none;  /* Safari */
    -ms-user-select: none;      /* IE 10 and IE 11 */
    user-select: none;          /* Standard syntax */
}


</style>