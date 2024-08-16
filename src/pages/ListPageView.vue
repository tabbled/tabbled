<template>
    <div v-if="pageStore.properties" class="list-page-view" >
        <el-page-header ref="mainHeader" class="list-page-view-header" @back="$router.back()">
            <template #content>
                <span> {{pageStore.properties.title}} </span>
            </template>
            <template #extra>
                <div class="page-actions">
                    <el-button text circle :icon="SettingsIcon"/>
                </div>
            </template>
        </el-page-header>
        <Grid class="page-grid" path="" :elements="pageStore.properties.elements"/>

    </div>

</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {PageConfigInterfaceV2} from "../model/page";
import {onMounted, ref, watch} from "vue";
import Grid from "../components/Grid.vue";
import {usePage} from "../store/pageStore";
import SettingsIcon from "../components/icons/settings-icon.vue";


let router = useRouter();
let route = useRoute();
let pageStore = usePage()



const props = defineProps<{
    alias: string
}>()

let pageProps = ref<PageConfigInterfaceV2>(null)

watch(() => props.alias,
    async () => {
        await init()
    })

onMounted(async () => {
    await init()
})

const init = async () => {
    console.log("Init list view")
    await pageStore.loadByAlias(props.alias)


    console.log(pageStore.properties)
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

.page-grid {
    overflow: auto;
    height: -webkit-fill-available;
}

.page-header-content {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.list-page-view {
    display: flex;
    flex-direction: column;
}

.list-page-view-header {
    padding: 16px;
}

</style>