<template>
    <div class="list-label">
        <span>
            {{label}}
        </span>
        <div>
            <slot name="actions">
                <el-button :icon="PlusIcon" size="small" text circle @click="emit('insert')"/>
            </slot>
        </div>
    </div>
    <el-card shadow="never" body-style="padding: 0" style="width: 100%">
        <div v-for="(item, idx)  in items" :id="item[keyProp]"
             :class="{'list-item': true, 'list-item-selected': currentIdx === idx}"
             @dragover="(e) => onDragOver(item, idx, e)"
             @dragend="() => finishDrag(item, idx)"
             @dragstart="(e) => startDrag(item, idx, e)"
             :draggable="sortable"

        >
            <div class="list-item-title" @click="emit('edit', idx); setCurrentIndex(idx)">
                <DragHorizontal v-if="sortable" class="drag-list-item"/>
                <slot :item="item" :index="idx" >
                    {{item[titleProp]}}
                </slot>
            </div>
            <div class="list-item-actions">
                <el-button link
                           size="small"
                           @click="emit('remove', idx)"
                           style="z-index: 99"

                >
                    <CloseIcon/>
                </el-button>
            </div>
        </div>

        <el-button v-if="!items || items.length === 0" link size="small"
                   style="margin: 4px;
                   padding-left: 8px"
                   @click="emit('insert')">
            {{$t('add')}}
        </el-button>
    </el-card>

</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import PlusIcon from "../icons/plus-icon.vue";
import CloseIcon from "../icons/close-icon.vue";
import DragHorizontal from '../icons/drag-horizontal-icon.vue'

interface Props {
    items?: any[]
    keyProp: string,
    titleProp: string,
    subtitle?: string,
    sortable?: boolean,
    removable?: boolean,
    insertable?:boolean,
    currentIndex?: number,
    label?: string
}

let currentIdx = ref(null)

let over: {
    pos: any,
    item: any,
    dir: any
}
let startLoc = 0
let dragging = false
let dragFrom = {}

const props = withDefaults(defineProps<Props>(), {
    sortable: true,
    removable: true,
    insertable: true,
    currentIndex: null,
    list: () => [],
    label: "label"
})
const emit = defineEmits(['edit', 'remove', 'insert', 'update:currentIndex'])
const slots = defineSlots<{
    default(props: { item: any, index:number }): any,
    actions(props: { }): any
}>()

watch(() => props.items,
    async () => {
        console.log('DataSet items', props.items)
    })

onMounted(() => {
   currentIdx.value = props.currentIndex
})

function setCurrentIndex(idx: number) {
    currentIdx.value = idx
    emit('update:currentIndex', idx)
}

function startDrag(item, i, e) {
    startLoc = e.clientY;
    dragging = true;
    dragFrom = item;
}

function finishDrag(item, pos) {
    props.items.splice(pos, 1)
    props.items.splice(over.pos, 0, item);
    over = null
}

function onDragOver(item, pos, e) {
    const dir = (startLoc < e.clientY) ? 'down': 'up';
    over = { item, pos, dir }
}


</script>

<style lang="scss">

.sortable {
    cursor: move
}

.list-item {
    display: flex;
    flex-flow: row;
    padding-top: 4px;
    padding-bottom: 4px;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}

.list-item-title {
    display: flex;
    flex-flow: wrap;
    align-items: center;
    padding-left: 8px;

    width: 100%;
}

.list-item-actions {
    opacity: 0;
    padding-right: 8px;
    display: flex;
}

.list-item:hover  {
    background: var(--el-color-primary-light-9);
}

.list-item-selected {
    background: var(--el-color-primary-light-8);
}

.list-item:hover .list-item-actions {
    opacity: 80;
}

.list-label {
    font-size: var(--el-form-label-font-size);
    color: var(--el-text-color-regular);
    line-height: 20px;
    margin-bottom: 4px;
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;

    .el-button+.el-button {
        margin-left: 4px;
    }
}

.drag-list-item {
    color: var(--el-button-text-color);
    opacity: 0.4;
    cursor: grab;
    margin-right: 8px;
}




</style>