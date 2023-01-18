<template>

    <div  class="grid-wrap">


        <component v-for="(element, idx) in elements"
             :id="idx"
             :style="getGridElementStyle(element.layout)"
             class="element"
                   :is="element.name" v-bind="element.properties"
        />

    </div>
</template>

<script setup lang="ts">

import _ from 'lodash'
import {useStore} from "vuex"
import {onMounted, watch, ref} from "vue";
import {ScreenSize, PageConfigInterface, PositionElementInterface, ElementInterface} from "../model/page";
import {useRouter, useRoute} from 'vue-router';
import {DataSet, useDataSet} from "../model/dataset";
import {usePageScriptHelper} from "../services/page.service";



let store = useStore();
let router = useRouter();
let route = useRoute();
const pageService = usePageScriptHelper(router)
const scriptContext = {
    pages: pageService,
    dataSets: {}
}
// const pagesActions = usePagesActions()
// let dsService = useDataSourceService();

let elements = ref<Array<ElementInterface>>([])
let dataSets = ref<Map<string, DataSet>>(new Map())
let grid = ref(null)

const props = defineProps<{
    pageConfig: PageConfigInterface,
    screenSize: ScreenSize
}>()

const actionButtons = ref<Array<Object>>( [])

defineExpose({
    actionButtons
})

watch(() => props.pageConfig,
    async () => {
        initLayoutElements()
    })

onMounted(() => {
    initLayoutElements()
})

function initLayoutElements() {
    elements.value = []
    dataSets.value.clear();

    props.pageConfig.dataSets.forEach(config => {
        let ds = useDataSet(config)
        dataSets.value.set(ds.alias, ds)
        scriptContext.dataSets[ds.alias] = ds
    })

    props.pageConfig.elements.forEach(element => {
        let el:ElementInterface = {
            layout: element.layout,
            name: element.name,
            properties: {}
        }

        Object.keys(element.properties).forEach(key => {
            if (key === 'dataSet') {
                if (element.properties.dataSet && element.properties.dataSet !== "") {
                    if (!dataSets.value.has(element.properties.dataSet)) {
                        console.warn(`DataSet "${element.properties.dataSet}" does not exist!`)
                    } else {
                        el.properties.dataSet = dataSets.value.get(element.properties.dataSet)
                    }
                }
            } else {
                el.properties[key] = _.cloneDeep(element.properties[key])
            }
        })
        el.properties['context'] = scriptContext
        elements.value.push(el)
    })

    // pagesActions.buttons = []
    // props.pageConfig.actions?.buttons?.forEach(async (action) => {
    //
    //     let compiledFunc: CompiledFunc
    //     let act = {
    //         title: action.title,
    //         type: action.type,
    //         func: async () => {
    //             try {
    //                 compiledFunc.exec(dataSets)
    //             } catch (e) {
    //                 console.error(`Execution error in action "${action.title}"`)
    //                 console.error(e);
    //             }
    //         }
    //     }
    //
    //     try {
    //         compiledFunc = await compileScript(action.script, 'dataSets')
    //         pagesActions.buttons.push(act)
    //     } catch (e) {
    //         console.error(`Compilation error in script for action "${action.title}"`)
    //         console.error(e)
    //     }
    // })

    dataSets.value.forEach(ds => {
        ds.load()
    })
}

function getGridElementStyle(layout: {[key in ScreenSize]: PositionElementInterface}) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: "fit-content"
    }

    let position = layout[props.screenSize]
    if (!position) {
        position = layout[ScreenSize.desktop] || layout[ScreenSize.mobile]
    }

    if (position.colFrom) {
        let c = String(position.colFrom);
        if (position.colTo) c += ' / ' + position.colTo;
        style.gridColumn = c;
    }
    if (position.rowFrom) {
        let r = String(position.rowFrom);
        if (position.rowTo) r += ' / ' + position.rowTo;
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