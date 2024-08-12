<template>
    <div v-if="properties" class="list-page-view" >
        <el-page-header ref="mainHeader" class="list-page-view-header" @back="$router.back()">
            <template #content>
                <span class="text-large font-600 mr-3"> {{route.meta.title}} </span>
            </template>
        </el-page-header>
        <TableV2 v-if="tableProps" style=" margin: 16px"
                 v-bind="tableProps"
                 :id="tableProps.id"
                 @update:property="(prop, value) => onComponentPropertyChange(tableProps.id, prop, value)"/>
    </div>

</template>

<script setup lang="ts">
import TableV2 from "../components/tableV2/TableV2.vue";
import {useRoute, useRouter} from "vue-router";
import {PageConfigInterface} from "../model/page";
import {onMounted, ref, watch} from "vue";

let router = useRouter();
let route = useRoute();

const props = defineProps<{
    properties: PageConfigInterface,
}>()

//let elements: Map<string, any> = new Map()

let pageProps = ref<PageConfigInterface>(null)

let tableProps = ref(null)

watch(() => props.properties,
    async () => {
        await init()
    })

onMounted(async () => {
    await init()
})

const init = () => {
    console.log("Init list view")
    pageProps.value = props.properties

    console.log(pageProps.value)

    tableProps.value = pageProps.value.elements.find(i => i.name === 'TableV2')
    //elements.set(tableProps.value.id, t)

    if(!tableProps.value) {
        console.error('Has no TableV2 props in elements')
    }
}

const onComponentPropertyChange = (componentId: string, prop: string, value: any) => {
    console.log('onComponentPropertyChange', componentId, prop, value)
    let comp = pageProps.value.elements.find(i => i.id === componentId)

    if (!comp) {
        console.error('onComponentPropertyChange', `Component by id ${componentId} not found`)
        return
    }
    //pageProps.value[prop] = value
    comp[prop] = value

    console.log(comp)
}

</script>

<style lang="scss">

.list-page-view {
    display: flex;
    flex-direction: column;
}

.list-page-view-header {
    padding: 16px;
}

</style>