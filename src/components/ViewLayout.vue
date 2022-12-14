<template>
<!--        <table ref="tablayout" style="width: 100%" @mouseup="endDrag" @mousemove="onDrag">-->

        <div ref="grid" class="grid-wrapper" @mouseup="endDrag" @mousemove="onDrag">


            <div v-for="(widget, idx) in vlayout.large"
                 :id="idx"
                 :style="getGridElStyle(widget)"

            >
                <div :class="{'widget-draggable': true, 'widget-selected': selectedIdx == idx}"
                     style="height: inherit"
                     @click="selectWidget"
                     :id="idx"
                >
                    {{widget.props.title}}
                    <div :class="{
                        'resizer-right': true,
                        'resizer-activated': (dragDirection === 'right' && dragIdx == idx)}"
                         @mousedown="initDragRight" :id="idx"></div>
                    <div :class="{
                        'resizer-bottom': true,
                        'resizer-activated': (dragDirection === 'bottom' && dragIdx == idx)}"
                         @mousedown="initDragBottom" :id="idx"></div>
                    <div class="dragging" @mousedown="initDragMove" :id="idx">
                        <span class="iconify dragging-icon" :id="idx"
                              data-icon="mdi:drag-vertical"
                        />
                    </div>
                </div>

            </div>

        </div>
</template>

<script setup lang="ts">
import {ref, reactive} from "vue";
import {LayoutComponentInterface} from "../model/layout";
import Tabled from './Table.vue'

const props = defineProps<{
    layout: object,
    /**
     * Needed for screen size adjustment
     */
    size: 'small' | 'large'
}>()

let vlayout = reactive(props.layout)
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let widget: object | null = null
let initWidget: object | null = null
let dragDirection = ref("");
let dragIdx = ref("")
let selectedIdx = ref("")

const grid = ref(null);


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

function selectWidget(e:MouseEvent) {
    console.log(e)
    selectedIdx.value = e.target.id
}

function initDrag(e:MouseEvent) {

    startX = e.clientX;
    startY = e.clientY;

    let widgetElement = e.target.parentNode

    startWidth = widgetElement.offsetWidth;
    startHeight = widgetElement.offsetHeight;

    widget = vlayout[props.size][e.target.id]
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
        let cTo = initWidget.cTo + colspan + 1
        let cFrom = initWidget.cFrom + colspan

        if (cTo <= 13 && cFrom >= 1) {
            widget.cFrom =  initWidget.cFrom + colspan;
            widget.cTo =  initWidget.cTo + colspan + 1;
        }

        let rowW = 40
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

function getGridElStyle(widget:object) {
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

</script>

<style lang="scss">

.grid-wrapper {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 10px;
    grid-auto-rows: minmax(40px, auto);
}



.widget-draggable {
    background: #f9f9f9;
    border-radius: 5px;
    border-style: dashed;
    position: relative;
    //pointer-events: none;
    z-index: 1;
    border-color: #00000012;
}

.widget-selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-3);
}

.widget-draggable .dragging {
    width: 20px;
    position: absolute;
    left: 5px;
    top: 5px;
    bottom: 5px;
    cursor: move;
    z-index: 2;
}

.dragging-icon{
    width: 30px;
    height: 30px;
    padding-right: 4px;
    position: absolute;
    color: rgba(203, 203, 203, 0.8);
    cursor: move;
    z-index: 0;
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

.widget-draggable:hover {
    background: var(--el-color-primary-light-9);
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

</style>