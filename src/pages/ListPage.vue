<template>
    <div ref="grid" class="grid-wrap">


        <div v-for="(element, idx) in elements"
             :id="idx"
             :style="getGridElementStyle(element.position)"
             class="element"
        >
            <component :is="element.component" v-bind="element.properties"></component>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex"
import { useSocket } from "../services/socketio.service";
import { onMounted, watch, ref } from "vue";
import { LayoutSize, PageConfigInterface, PositionElementInterface } from "../model/page";
import { useRouter, useRoute } from 'vue-router';
import { DataSourceInterface } from "../model/datasource";
import { useDataSourceService } from "../services/datasource.service";
import {usePagesActions} from "../services/page.service";
import { DataSet } from "../model/dataset";

export interface ElementInterface {
    component: string,
    position: PositionElementInterface,
    properties: {
        [name: string]: any
    }
}

let store = useStore();
let socket = useSocket();
let router = useRouter();
let route = useRoute();
const pagesActions = usePagesActions()
let dsService = useDataSourceService();
let dataset = ref<DataSet>(new DataSet())

let dataSource = ref<DataSourceInterface>()

let elements = ref<Array<ElementInterface>>([])

const props = defineProps<{
    pageConfig: PageConfigInterface,
    layoutSize: LayoutSize
}>()

const actionButtons = ref<Array<Object>>( [{title: props.pageConfig.title}])

defineExpose({
        actionButtons
})

watch(() => props.layoutSize,
    async () => {
        initLayoutElements()
    })

watch(() => props.pageConfig,
    async () => {
        console.log('props.pageConfig')
        initLayoutElements()



    })

onMounted(() => {
    //console.log('onMounted')
    initLayoutElements()
})



function initLayoutElements() {
    elements.value = []
    dataSource.value = dsService.getDataSourceByAlias(props.pageConfig.dataSource)
    dataset.value.dataSource = dataSource.value

    if (!dataSource.value)
        console.warn(`DataSource "${props.pageConfig.dataSource}" does not exist!`)

    if (!props.pageConfig.layout || !props.pageConfig.layout[props.layoutSize]) {
        console.warn(`Layout for ${props.layoutSize} does not exist!`)
        return;
    }
    let layout = props.pageConfig.layout[props.layoutSize];
    layout.forEach(element => {
        let el:ElementInterface = {
            position: element.position,
            component: element.component.name,
            properties: {}
        }

        if (element.component.name === 'Table') {
            el.properties.columns = element.component.columns

            if (element.component.dataSource && element.component.dataSource !== props.pageConfig.dataSource) {
                console.warn(`Different datasource for child component
                                      "Table" on ListPage doesn't support.`)
            }

            el.properties.dataSet = dataset.value
        }

        elements.value.push(el)
    })

    //Test page actions that show in the page header
    pagesActions.buttons = [{
        type: 'primary' ,
        title: "Add " + props.pageConfig.title,
        act: () => { console.log('act ADD')}
        },{
        title: "Edit",
        type: 'text',
        act: () => { console.log('act EDIT')}
    }]

    dataset.value.load()
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