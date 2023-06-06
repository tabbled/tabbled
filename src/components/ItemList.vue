<template>
    <el-card shadow="never" body-style="padding: 0" style="width: 100%">
        <div v-for="(item, idx)  in list" :id="item[keyProp]"
             :class="{'list-item': true, 'list-item-selected': currentIdx === idx}"
             @dragover="(e) => onDragOver(item, idx, e)"
             @dragend="() => finishDrag(item, idx)"
             @dragstart="(e) => startDrag(item, idx, e)"
             :draggable="sortable"
        >
            <div class="list-item-title" @click="emit('edit', idx); setCurrentIndex(idx)">
                <Icon v-if="sortable"
                      icon="ic:baseline-drag-indicator"
                      style="padding-right: 4px; color: var(--el-border-color);" width="16"
                      :class="{'sortable': sortable }"
                />
                <slot :item="item" :index="idx">
                    {{item[titleProp]}}
                </slot>
            </div>
            <div class="list-item-actions">
                <el-button link
                           size="small"
                           @click="emit('remove', idx)"
                           style="z-index: 99"
                >
                    <Icon icon="ic:baseline-delete" width="16"
                          />
                </el-button>
            </div>
        </div>
        <el-divider v-if="list.length > 0" style="margin: 0"/>
        <el-button link size="small"
                   style="margin: 4px;
                   padding-left: 8px"
                   @click="emit('insert')">
            {{$t('add')}}
        </el-button>
    </el-card>

</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {Icon} from "@iconify/vue";

interface Props {
    list?: any[]
    keyProp: string,
    titleProp: string,
    subtitle?: string,
    sortable?: boolean,
    removable?: boolean,
    insertable?:boolean,
    currentIndex?: number
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
    list: () => []
})
const emit = defineEmits(['edit', 'remove', 'insert', 'update:currentIndex'])

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
    props.list.splice(pos, 1)
    props.list.splice(over.pos, 0, item);
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
}

.list-item-title {
    display: flex;
    flex-flow: wrap;
    align-items: center;
    padding-left: 8px;
    cursor: pointer;
    width: 100%;
}

.list-item-title:hover {
    color: var(--el-color-primary);
}

.list-item-actions {
    opacity: 0;
    padding-right: 8px
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




</style>