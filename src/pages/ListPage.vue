<template>

    <div  class="grid-wrap">


        <component v-for="(element, idx) in elements"
             :id="idx"
             :style="getGridElementStyle(element.position)"
             class="element"
                   :is="element.component" v-bind="element.properties"
        />

    </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex"
import { useSocketClient } from "../services/socketio.service";
import { onMounted, watch, ref } from "vue";
import { LayoutSize, PageConfigInterface, PositionElementInterface } from "../model/page";
import { useRouter, useRoute } from 'vue-router';
import { DataSourceInterface } from "../model/datasource";
import { useDataSourceService } from "../services/datasource.service";
import {usePagesActions} from "../services/page.service";
import { DataSet } from "../model/dataset";
import { compileScript, CompiledFunc } from "../services/compiler"
import _ from 'lodash'

export interface ElementInterface {
    component: string,
    position: PositionElementInterface,
    properties: {
        [name: string]: any
    }
}

let store = useStore();
let socketClient = useSocketClient();
let router = useRouter();
let route = useRoute();
const pagesActions = usePagesActions()
let dsService = useDataSourceService();

let elements = ref<Array<ElementInterface>>([])
let dataSets = ref<Map<string, DataSet>>(new Map())
let grid = ref(null)

const props = defineProps<{
    pageConfig: PageConfigInterface,
    layoutSize: LayoutSize
}>()

const actionButtons = ref<Array<Object>>( [])

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
    dataSets.value.clear();

    props.pageConfig.dataSets.forEach(config => {
        let dataSource:DataSourceInterface | undefined = dsService.getDataSourceByAlias(config.dataSource)

        if (!dataSource) {
            console.warn(`DataSource "${config.dataSource}" does not exist!`)
            return;
        }

        let ds = new DataSet(config.alias, dataSource, config.columns);
        dataSets.value.set(ds.alias, ds)
    })

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

        //Need to define a property mapping from config to element props,
        //like dataSet name -> instance of certain dataSet
        Object.keys(element.component).forEach(key => {
            if (key === 'dataSet') {
                if (element.component.dataSet && element.component.dataSet !== "") {
                    if (!dataSets.value.has(element.component.dataSet)) {
                        console.warn(`DataSet "${element.component.dataSet}" does not exist!`)
                    } else {
                        el.properties.dataSet = dataSets.value.get(element.component.dataSet)
                    }
                }
            } else {
                el.properties[key] = _.cloneDeep(element.component[key])
            }
        })

        elements.value.push(el)
    })

    pagesActions.buttons = []
    props.pageConfig.actions?.buttons?.forEach(async (action) => {

        let compiledFunc: CompiledFunc
        let act = {
            title: action.title,
            type: action.type,
            func: async () => {
                try {
                    compiledFunc.exec(dataSets.value)
                } catch (e) {
                    console.error(`Execution error in action "${action.title}"`)
                    console.error(e);
                }
            }
        }

        try {
            compiledFunc = await compileScript(action.script, 'dataSets')
            pagesActions.buttons.push(act)
        } catch (e) {
            console.error(`Compilation error in script for action "${action.title}"`)
            console.error(e)
        }
    })

    dataSets.value.forEach(ds => {
        ds.load()
    })
}

function getGridElementStyle(element:PositionElementInterface) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: "fit-content"
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
    grid-auto-rows: minmax(20px, auto);
    width: 100%;
    grid-auto-flow: dense
}

.element {
    height: 20px;
    width: 100%;
}

</style>