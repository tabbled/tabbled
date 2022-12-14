<template>

    <el-row align="middle" style="padding-bottom: 16px">
        <div>Screen size: </div>
        <el-radio-group v-model="selectedSize" style="padding-left: 8px">
            <el-radio-button v-for="i in getAvailableLayoutSizes($t)" :label="i.size">{{i.title}} </el-radio-button>
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


            <div v-for="(widget, idx) in vlayout[selectedSize]"
                 :id="String(idx)"
                 :style="getGridElStyle(widget)"

            >
                <div :class="{'widget-draggable': true, 'prevent-select': true}"
                     style="height: inherit"
                     :id="String(idx)"
                >
                    <WidgetElement :title="widget.title" :subtitle="widget.alias" :icon="widget.icon" style="height: inherit;"
                                   :class="{'widget-selected': selectedIdx === String(idx)}"/>
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

    <div class="setting-panel">
        <el-divider direction="vertical" class="setting-panel-divider"/>

        <span>Elements</span>

        <div style="padding-top: 16px">
        <div v-for="item in availableWidgets"
             class="new-widget-draggable"
             draggable="true"
             @dragstart="startDragNewWidget($event, item)"
        >
            <WidgetElement :title="item.title" :subtitle="item.alias" icon="table"></WidgetElement>
        </div>
        </div>

        <Transition  name="setting-panel-trans">
                <ElementSettingPanel class="element-setting-panel"
                                     v-if="selectedIdx !== ''">

                </ElementSettingPanel>
        </Transition>
    </div>

</template>

<script setup lang="ts">
import {ref, reactive} from "vue";
import WidgetElement from "./WidgetElement.vue"
import {getAvailableLayoutSizes, LayoutSize} from "../model/page";
import ElementSettingPanel from "./ElementSettingPanel.vue"

const props = defineProps<{
    layout: object,
    /**
     * Needed for screen size adjustment
     */
    size: LayoutSize,
    availableWidgets: [{
        title: string,
        alias: string,
        datatype: string
    }]
}>()

let vlayout = reactive(props.layout)
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let widget: any | null = null
let initWidget: any | null = null
let dragDirection = ref("");
let dragIdx = ref("")
let selectedIdx = ref("")
let selectedSize = ref(props.size)

const grid = ref(null);

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
    vlayout[selectedSize.value].splice(idx, 1);
}

function initDrag(e:MouseEvent) {

    startX = e.clientX;
    startY = e.clientY;

    // @ts-ignore
    let widgetElement = e.target.parentNode

    startWidth = widgetElement.offsetWidth;
    startHeight = widgetElement.offsetHeight;

    // @ts-ignore
    widget = vlayout[selectedSize.value][e.target.id]
    // @ts-ignore
    dragIdx = e.target.id
    initWidget = Object.assign({}, widget)
}

function onDrag(e: MouseEvent) {
    if (!widget)
        return;

    if (dragDirection.value == 'right') {
        let colW = ( grid?.value?.offsetWidth / 12 );
        let colspan = Math.round((e.clientX - startX -40)  / colW)
        let cTo = initWidget.cTo + colspan + 1
        widget.cTo =  cTo <= 13 ? initWidget.cTo + colspan + 1 : 13;
    }

    if (dragDirection.value == 'bottom') {
        let rowW = 40
        let rowspan = Math.round((e.clientY - startY - 20)  / rowW)
        widget.rTo = initWidget.rTo + rowspan;
    }

    if (dragDirection.value == 'move') {
        let colW = ( grid?.value?.offsetWidth / 12 );
        let colspan = Math.round((e.clientX - startX)  / colW)
        let cTo = initWidget.cTo + colspan
        let cFrom = initWidget.cFrom + colspan

        if (cTo <= 13 && cFrom >= 1) {
            widget.cFrom =  initWidget.cFrom + colspan;
            widget.cTo =  initWidget.cTo + colspan;
        }

        let rowW = 50
        let rowspan = Math.round((e.clientY - startY)  / rowW)

        if ((initWidget.rFrom + rowspan) >= 1) {
            widget.rFrom = initWidget.rFrom + rowspan;
            widget.rTo = initWidget.rTo + rowspan;
        }

    }
}

function endDrag() {
    widget = null;
    dragDirection.value = ""
}

function getGridElStyle(widget:any) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: '100%'
    }

    if (widget.cFrom) {
        let c = String(widget.cFrom);
        if (widget.cTo) c += ' / ' + widget.cTo;
        style.gridColumn = c;
    }
    if (widget.rFrom) {
        let r = String(widget.rFrom);
        if (widget.rTo) r += ' / ' + widget.rTo;
        style.gridRow = r;
    }
    return style;
}

function startDragNewWidget(e:any, item: any) {
    let it = Object.assign({
        layerX: e.layerX,
        layerY: e.layerY
    }, item)
    e.dataTransfer?.setData('item', JSON.stringify(it))
}

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

    vlayout[selectedSize.value].push({
        cFrom: startCol,
        cTo: endCol,
        rFrom: startRow,
        rTo: startRow + item.defaultRows,
        type: item.datatype,
        alias: item.alias,
        title: item.title,
        icon: 'table',
    })


    // const itemID = e.dataTransfer.getData('itemID')
    // const item = this.items.find((item) => item.id == itemID)
    // item.list = list
}

</script>

<style lang="scss">

.grid-wrapper {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(10, 1fr);
    gap: 10px;
    grid-auto-rows: minmax(40px, auto);
    width: calc(100% - 250px);

}

.setting-panel {
    width: 216px;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    background: white;
    padding-left: 16px;
}

.element-setting-panel {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    position: absolute;
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