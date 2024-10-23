<template>

    <Page v-if="pageStore.loaded && pageStore.properties"
          :title="pageStore.properties.title"
          :elements="pageStore.properties.elements"
          @settings-request="openSettings"
    />

</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, onUnmounted, watch, ref} from "vue";
import {usePage} from "../store/pageStore";

import Page from "../components/page/Page.vue";
import {DataSetInterface} from "../components/dataset";


let router = useRouter();
let route = useRoute();
let pageStore = usePage()

let datasets = ref<DataSetInterface[]>([])


const props = defineProps<{
    alias: string,
}>()


watch(() => props.alias,
    async () => {
        await init()
    })

// watch(() => pageStore.properties.datasets,
//     async () => {
//         console.log('<<<')
//     })



onMounted(async () => {
    await init()
    //
})

onUnmounted(() => {
    pageStore.loaded = false
    pageStore.properties = null
})

const init = async () => {
    console.log("Init list view")
    await pageStore.loadByAlias(props.alias)
    console.log("loaded", pageStore.$state)
    //datasets.value = pageStore.properties.datasets
    //console.log(pageStore.properties.datasets)

}

const openSettings = async () => {
    try {
        pageStore.openSettings('', 'Page')
    } catch (e) {
        console.error(e)
    }
}

// const onComponentPropertyChange = (componentId: string, prop: string, value: any) => {
//     console.log('onComponentPropertyChange', componentId, prop, value)
//     let comp = pageProps.value.elements.find(i => i.id === componentId)
//
//     if (!comp) {
//         console.error('onComponentPropertyChange', `Component by id ${componentId} not found`)
//         return
//     }
//     //pageProps.value[prop] = value
//     comp[prop] = value
//
//     console.log(comp)
// }

</script>

<style lang="scss">



</style>