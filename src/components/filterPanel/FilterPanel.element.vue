<template>
<div class="filter-panel-wrapper">
    <div class="filter-panel-items-wrapper">
        <FilterPanelItem v-for="(item, idx) in items"
                         :id="item.id"
                         :item="item"
                         :path="`${path}[${idx}]`"
                         :dataset="datasetInst"
                         :value="valuesByItemId[item.id]"
                         @change="(e) => onFilterChange(e)"
        />
    </div>
    <el-button type="info" round circle text :icon="SettingsIcon" class="table-settings-button" @click="openSettings"/>
</div>

</template>

<script setup lang="ts">

import {usePage} from "../../store/pageStore";
import {DataSet, FilterItemInterface} from "../dataset";
import {onMounted, ref, watch, onUnmounted, onBeforeMount} from 'vue'
import SettingsIcon from "../icons/settings-icon.vue";
import {FilterPanelItemInterface} from "./index";
import FilterPanelItem from "./FilterPanelItem.vue";

//import _ from 'lodash'

let pageStore = usePage()
let datasetInst = ref<DataSet>(null)
let valuesByItemId = ref({})
let value = ref(null)

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
    datasetInst.value = pageStore.datasets[props.dataset]
})

onBeforeMount(() => {
    datasetInst.value = pageStore.datasets[props.dataset]
})

onMounted(() => {
    let vals = localStorage.getItem(`filter-panel-${props.id}`)
    if (vals)
        valuesByItemId.value = JSON.parse(vals)
})

onUnmounted(() => {
    datasetInst.value = null
})

const onFilterChange = (filter: FilterItemInterface) => {
    valuesByItemId.value[filter.id] = filter.compare
    datasetInst.value.setFilter([filter])
    datasetInst.value.loadNext(true)

    localStorage.setItem(`filter-panel-${props.id}`, JSON.stringify(valuesByItemId.value))
}

const openSettings = async () => {
    try {
        pageStore.openSettings(props.path + '.properties', 'FilterPanel', props.parentPath)
    } catch (e) {
        console.error(e)
    }
}
//
// const onPropertyUpdate = (property, value) => {
//     pageStore.setPropertyByPath(`${props.path}.properties.${property}`, value)
// }


</script>

<style lang="scss">
.filter-panel-wrapper {
    display: flex;
    flex-direction: row;
    //border: 1px solid var(--el-border-color);
    //border-radius: 3px;
    justify-content: space-between;

}

.filter-panel-items-wrapper {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
}



</style>