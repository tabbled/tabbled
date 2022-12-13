<template>
        <table ref="tablayout" style="width: 100%" @mouseup="endDrag" @mousemove="onDrag">
            <thead>
            <tr >

                <th v-for="i in 12" style="width: 8%"></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(row, rindex) in vlayout.desktop.rows">

                <td v-for="(widget,windex) in row.widgets"
                    :colspan="widget.colspan"
                    :rowspan="widget.rowspan"
                >
                    <div>
                        <div class="widget-draggable"
                             :id="rindex + '|' + windex"


                        >

                            asdasd
                            <div class="resizer-right" @mousedown="initDrag"></div>
                            <div class="resizer-bottom" @mousedown="initDrag"></div>
                        </div>

                    </div>

                </td>

            </tr>
            </tbody>

        </table>


</template>

<script setup lang="ts">
import {ref, reactive} from "vue";
import {LayoutComponentInterface} from "../model/layout";
import Tabled from './Table.vue'

const props = defineProps<{
    layout: object,
}>()

console.log(props.layout)

let vlayout = reactive(props.layout)
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0
let widget: object | null = null

const tablayout = ref(null);

function initDrag(e:MouseEvent) {
    console.log()

    startX = e.clientX;
    startY = e.clientY;

    let wElement = e.target.parentNode

    startWidth = wElement.offsetWidth;
    startHeight = wElement.offsetHeight;

    let row_idx = wElement.id.split('|')[0];
    let widget_idx = wElement.id.split('|')[1];

    widget = vlayout.desktop.rows[row_idx].widgets[widget_idx]

    //w.colspan += 1

    console.log(row_idx, widget_idx, vlayout.desktop)
}

function onDrag(e: MouseEvent) {
    if (!widget)
        return;

    let colW = ( tablayout.value.offsetWidth / 12 );

    let colspan = Math.round((startWidth + e.clientX - startX)  / colW)

    console.log(startWidth + e.clientX - startX, colspan)
    widget.colspan = colspan
}

function endDrag(e) {
    console.log('endDrag', e)
    widget = null;
}

</script>

<style lang="scss">
    .widget-draggable {
        background: #f9f9f9;
        border-radius: 10px;
        border-style: dashed;
        position: relative;
    }
    //  For disable clicking on widget
    //  pointer-events: none;

    .widget-draggable .resizer-right {
        width: 5px;
        height: 100%;
        background: transparent;
        position: absolute;
        right: 0;
        bottom: 0;
        cursor: col-resize;
    }

    .widget-draggable .resizer-bottom {
        width: 100%;
        height: 5px;
        background: transparent;
        position: absolute;
        right: 0;
        bottom: 0;
        cursor: row-resize;
    }

</style>