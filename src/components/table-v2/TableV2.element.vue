<template>
    <TableV2 v-if="datasetInst"
             :id="id"
             :title="title"
             :dataset="datasetInst"
             :inline-edit="inlineEdit"
             @update:property="onPropertyUpdate"
             @settings-request="openSettings"
             :settings-visible="page.editMode"
             class="h-fit"
    />
    <div v-else>No dataset</div>
</template>

<script setup lang="ts">

import TableV2 from "./TableV2.vue";
import {usePage} from "../../store/pageStore";
import {DataSet} from "../dataset";
import {onMounted, ref, watch, onUnmounted, onBeforeMount} from 'vue'

let page = usePage()
let datasetInst = ref<DataSet>(null)

interface Props {
    id: string
    dataset: string
    title?: string
    path: string
    inlineEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
    datasourceType: 'datasource',
    inlineEdit: false
})

watch(() => props.dataset, () => {
    console.log('<<<', props.title)

    //datasetInst.value = null
    //dsFound.value = false
    // console.log(props.dataset)
    datasetInst.value = page.datasets[props.dataset]
    // console.log(props.dataset)
})

onMounted(() => {
})

onBeforeMount(() => {
    datasetInst.value = page.datasets[props.dataset]
})

onUnmounted(() => {
    datasetInst.value = null
})

const openSettings = async (path, component) => {
    try {
        let parentPath = props.path + '.properties'
        let p = `${parentPath}${path ? '.' + path : ''}`
        page.openSettings(p, component, parentPath)
    } catch (e) {
        console.error(e)
    }
}

const onPropertyUpdate = (property, value) => {
    page.setPropertyByPath(`${props.path}.properties.${property}`, value)
}

</script>

<style scoped>

</style>