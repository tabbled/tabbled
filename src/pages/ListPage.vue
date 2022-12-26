<template>
    <div>Page view {{layoutSize.value}} {{pageConfig.layout[layoutSize.value]}} </div>

    <div ref="grid" class="grid-wrap"
    >


        <div v-for="(element, idx) in pageConfig.layout[layoutSize.value]"
             :id="idx"
             :style="getGridElementStyle(element.position)"
             class="element"
        >
            <component :is="elementsProps[idx].component" v-bind="elementsProps[idx].properties"></component>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex"
import { useSocket } from "../services/socketio.service";
import { onMounted, watch, ref } from "vue";
import { LayoutSize, PageConfigInterface, PositionElementInterface } from "../model/page";
import {useRouter, onBeforeRouteUpdate, useRoute} from 'vue-router';
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";

let store = useStore();
let socket = useSocket();
let router = useRouter();
let route = useRoute()
let dsService = useDataSourceService()

let dataSource = ref<DataSourceInterface>()
let elementsProps = ref<Array<Object>>()

onBeforeRouteUpdate(async (to, from) => {
    // only fetch the user if the id changed as maybe only the query or the hash changed
    console.log('onBeforeRouteUpdate', to, from)
})

const props = defineProps<{
    pageConfig: PageConfigInterface,
    layoutSize: LayoutSize
}>()

watch(() => route.path,
    async () => {
        initLayoutElements()
    })

onMounted(() => {
    initLayoutElements()
})

function initLayoutElements() {
    console.log('initLayoutElements')
    console.log(props.pageConfig)
    dataSource.value = dsService.getDataSourceByAlias(props.pageConfig.dataSource)

    if (!dataSource.value)
        console.warn(`DataSource ${props.pageConfig.dataSource} does not exist!`)

    props.pageConfig.layout



console.log(dataSource)

}

function getGridElementStyle(element:PositionElementInterface) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: '40px'
    }

    if (element.colFrom) {
        let c = String(element.colFrom);
        if (element.colTo) c += ' / ' + element.colTo;
        style.gridColumn = c;
    }
    if (element.rowFrom) {
        let r = String(element.rowFrom);
        if (element.rowTo) r += ' / ' + element.rowTo;
        style.gridRow = r;
    }
    return style;
}

</script>

<style lang="scss">

.grid-wrap {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 10px;
    grid-auto-rows: minmax(40px, auto);
    width: 100%
}

.element {
   background: #535bf2;
    height: 30px;
    width: 100%;
}

</style>