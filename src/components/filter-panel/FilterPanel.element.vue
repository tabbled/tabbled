<template>
<div class="block w-full">
    <div class="flex flex-row flex-wrap ">
        <div v-for="(item, idx) in items" class="flex flew-row items-end" :style="{width: item.width}">
            <FilterPanelItem
                :id="item.id"
                :ref="item.id"
                :item="item"
                class="w-full"
                :path="`${path}[${idx}]`"
                :dataset="datasetInst"
                :value="valuesByItemId[item.id]"
                :editMode="page.editMode"
                @change="(e) => onFilterChange(e)"
                @open-settings="(e, wrapper) => openItemSettings(e, item, idx, wrapper)"
            />

            <div v-if="page.editMode" class="w-7 h-9 items-center opacity-0 hover:opacity-100 flex justify-center border border-dashed ml-1 mr-1 rounded hover:border-blue-300"
                 @click="addNewItem(idx)"
            >
                <PlusIcon style="width: 16px; height: 16px"/>
            </div>
            <div v-else-if="!page.editMode" class="w-7 h-9 border ml-1 mr-1 opacity-0"></div>

        </div>


    </div>
    <ContextMenu
                 :x="contextMenuX"
                 v-model:visible="settingsOpened"
                 :y="contextMenuY"
                 :width="settingsWidth + 'px'"
    >
        <SettingsPanel class="w-full"
                       v-model="currentEditItem"
                       :dataset="datasetInst"
                       @close="settingsOpened = false"
                       @remove="removeFilterItem"
                       @change="itemChanged()"
        />
    </ContextMenu>
<!--    <el-button type="info" round circle text :icon="SettingsIcon" class="table-settings-button" @click="openSettings"/>-->
</div>

</template>

<script setup lang="ts">

import {usePage} from "../../store/pageStore";
import {DataSet, FilterItemInterface} from "../dataset";
import {onMounted, ref, watch, onUnmounted, onBeforeMount} from 'vue'
import {FilterPanelItemInterface} from "./index";
import FilterPanelItem from "./FilterPanelItem.vue";
import ContextMenu from "../ContextMenu.vue";
import SettingsPanel from "./FilterItemSettingsPanel.vue";
import PlusIcon from "../icons/plus-icon.vue";
import {FlakeId} from "../../flake-id"
const fId = new FlakeId()

//import _ from 'lodash'

let page = usePage()
let datasetInst = ref<DataSet>(null)
let valuesByItemId = ref({})
let value = ref(null)
let settingsOpened = ref(false)
let contextMenuX = ref(0)
let contextMenuY = ref(0)
let settingsWidth = 300
let currentEditItem = ref(null)
let currentEditItemIndex = -1

interface Props {
    id: string
    dataset: string
    path: string
    parentPath: string
    items: FilterPanelItemInterface[]
}

const props = withDefaults(defineProps<Props>(), {
    items: () => []
})

watch(() => props.dataset, () => {
    datasetInst.value = page.datasets[props.dataset]
})

onBeforeMount(() => {
    datasetInst.value = page.datasets[props.dataset]
})

onMounted(() => {
    let vals = localStorage.getItem(`filter-panel-${props.id}`)
    if (vals)
        valuesByItemId.value = JSON.parse(vals)
})

onUnmounted(() => {
    datasetInst.value = null
})

const addNewItem = (idx) => {

    props.items.splice(idx+1, 0,{
        id: fId.generateId().toString(),
        field: "",
        title: "New filter",
        width: "200px",

    })
    onPropertyUpdate(props.path, props.items)
}

const openItemSettings = (e, item, idx, wrapper) => {

    let pos = wrapper.getBoundingClientRect()
    console.log(Math.min(window.innerWidth - settingsWidth, pos.x))
    currentEditItemIndex = idx
    currentEditItem.value = item
    contextMenuX.value = Math.min(window.innerWidth - settingsWidth - 8, pos.x);
    contextMenuY.value = pos.y + pos.height + 2;
    settingsOpened.value = true
}

const onFilterChange = (filter: FilterItemInterface) => {
    valuesByItemId.value[filter.id] = filter.compare
    datasetInst.value.setFilter([filter])
    datasetInst.value.loadNext(true)

    localStorage.setItem(`filter-panel-${props.id}`, JSON.stringify(valuesByItemId.value))
}

const openSettings = async () => {
    try {
        page.openSettings(props.path + '.properties', 'FilterPanel', props.parentPath)
    } catch (e) {
        console.error(e)
    }
}

const removeFilterItem = () => {
    if (!currentEditItem.value)
        return

    props.items.splice(currentEditItemIndex, 1)
    currentEditItemIndex = -1
    currentEditItem.value = null
    settingsOpened.value = false
    onPropertyUpdate(props.path, props.items)
}

const itemChanged = () => {
    console.log('change')
    onPropertyUpdate(`${props.path}[${currentEditItemIndex}]`, currentEditItem.value)
}

const onPropertyUpdate = (property, value) => {
    page.setPropertyByPath(`${props.path}.properties.${property}`, value)
}


</script>

<style lang="scss">
//.filter-panel-wrapper {
//    display: flex;
//    flex-direction: row;
//    //border: 1px solid var(--el-border-color);
//    //border-radius: 3px;
//    justify-content: space-between;
//
//}
//
//.filter-panel-items-wrapper {
//    display: flex;
//    flex-direction: row;
//    gap: 8px;
//    flex-wrap: wrap;
//}



</style>