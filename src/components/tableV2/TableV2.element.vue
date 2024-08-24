<template>
    <TableV2 v-if="datasetInst"
              id=""
             :height="height"
             :title="title"
             :dataset="datasetInst"
             :inline-edit="inlineEdit"
             :style="{height: height + 'px'}"
             @settings-request="openSettings"/>
</template>

<script setup lang="ts">

import TableV2 from "./TableV2.vue";
import {usePage} from "../../store/pageStore";
import {DataSet} from "../dataset";
import {onMounted, ref, watch, onUnmounted} from 'vue'
import _ from 'lodash'

let pageStore = usePage()
let datasetInst = ref<DataSet>(null)

interface Props {
    id: string
    dataset: string
    title?: string
    path: string
    height: number
    inlineEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
    title: "",
    datasourceType: 'datasource',
    height: 400,
    inlineEdit: false
})

watch(() => props.dataset, () => {
    console.log('<<<', props.title)

    //datasetInst.value = null
    //dsFound.value = false
    // console.log(props.dataset)
    datasetInst.value = pageStore.datasets[props.dataset]
    // console.log(props.dataset)
})

onMounted(() => {
    console.log('TableV2.element mounted', props, _.has(pageStore.datasets, props.dataset))
    datasetInst.value = pageStore.datasets[props.dataset]
    console.log(datasetInst.value)
})

onUnmounted(() => {
    datasetInst.value = null
})

const openSettings = async () => {
    try {
        pageStore.openSettings(props.path + '.properties', 'TableV2')
    } catch (e) {
        console.error(e)
    }
}

</script>

<style scoped>

</style>