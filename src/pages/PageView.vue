<template>
    <div class="page-view">
        <el-page-header ref="mainHeader" style="padding: 0; padding-bottom: 16px" @back="$router.back()">
            <template #content>
                <span class="text-large font-600 mr-3"> {{route.meta.title}} </span>
            </template>

            <template #extra>
                <div class="page-header-action-panel">
                    <el-button v-for="action in pageHeader.actions"
                               :type="action.type ? action.type : 'default'"
                               @click="action.func()"
                    >
                        {{action.title}}
                    </el-button>
                </div>
            </template>
        </el-page-header>

        <div  class="grid-wrap">


            <component v-for="(element, idx) in elements"
                       :id="idx"
                       :style="getGridElementStyle(element.layout)"
                       class="element"
                       :is="element.name" v-bind="element"
            />

        </div>
    </div>
</template>

<script setup lang="ts">

import _ from 'lodash'
import {useStore} from "vuex"
import {onMounted, watch, ref} from "vue";
import {ScreenSize, PageConfigInterface, PositionElementInterface, ElementInterface} from "../model/page";
import {useRouter, useRoute} from 'vue-router';
import {DataSet, useDataSet} from "../model/dataset";
import {usePageScriptHelper, usePageHeader} from "../services/page.service";
import {CompiledFunc, compileScript} from "../services/compiler";

let store = useStore();
let router = useRouter();
let route = useRoute();
const pageService = usePageScriptHelper(router)
const scriptContext = {
    pages: pageService,
    page: {
        dataSets: {},
        params: {}
    }
}
const pageHeader = usePageHeader()

let elements = ref<Array<ElementInterface>>([])
let dataSets = ref<Map<string, DataSet>>(new Map())
let grid = ref(null)

const props = defineProps<{
    pageConfig: PageConfigInterface,
    screenSize: ScreenSize
}>()

let actions = ref({
    onOpen: null
})

const actionButtons = ref<Array<Object>>( [])

defineExpose({
    actionButtons
})

watch(() => props.pageConfig,
    async () => {
        await init()
    })

onMounted(async () => {
    await init()
})

async function init() {
    if (!props.pageConfig) {
        router.back()
        console.error(`Page has no config`)
        return;
    }

    if (props.pageConfig.isEditPage && !route.params.id) {
        console.error(`id is not provided for edit page "${props.pageConfig.alias}"`)
        return;
    }

    console.log('init onOpen', props.pageConfig.onOpen)

    actions.value.onOpen = await compileAction(props.pageConfig.onOpen)

    elements.value = []
    dataSets.value.clear();

    scriptContext.page.params = route.params



    props.pageConfig.dataSets.forEach(config => {
        let ds = useDataSet(config)
        dataSets.value.set(ds.alias, ds)
        scriptContext.page.dataSets[ds.alias] = ds
    })

    props.pageConfig.elements.forEach(element => {
        let el:ElementInterface = {
            layout: element.layout,
            name: element.name,
        }

        Object.keys(element).forEach(key => {
            if (key === 'dataSet') {
                if (element.dataSet && element.dataSet !== "") {
                    if (!dataSets.value.has(element.dataSet)) {
                        console.warn(`DataSet "${element.dataSet}" does not exist!`)
                    } else {
                        el.dataSet = dataSets.value.get(element.dataSet)
                    }
                }
            } else {
                el[key] = _.cloneDeep(element[key])
            }
        })
        el['context'] = scriptContext
        elements.value.push(el)
    })
    pageHeader.actions = []

    for(let i in props.pageConfig.headerActions) {
        const action = props.pageConfig.headerActions[i]

        let compiledFunc: CompiledFunc
        let act = {
            title: action.title,
            type: action.type,
            func: async () => {
                try {
                    await execAction(compiledFunc)
                } catch (e) {
                    //console.error(`Execution error in action "${action.title}"`)
                    //console.error(e);
                }
            }
        }

        try {
            compiledFunc = await compileAction(action.onClick)
            pageHeader.actions.push(act)
        } catch (e) {
            //console.error(`Compilation error in script for action "${action.title}"`)
            //console.error(e)
        }
    }

    dataSets.value.forEach(ds => {
        if (ds.autoOpen) {
            if (props.pageConfig.isEditPage) {
                ds.openOne(<string>route.params.id);
            } else
                ds.open()
        }
    })

    if (actions.value.onOpen) {
        await execAction(actions.value.onOpen)
    }
}

async function compileAction(action) {
    console.log(action)
    if (!action || (action.type === 'script' && (!action.script || action.script === '')))
        return null

    try {
        return await compileScript(action.script, 'ctx')
    } catch (e) {
        console.error(e)
        return null
    }
}

async function execAction(action: CompiledFunc, additionalContext?: object) {
    try {
        let ctx = Object.assign(scriptContext, additionalContext)
        action.exec(ctx)
    } catch (e) {
        console.error(`Execution error in action`)
        console.error(e);
    }
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

.page-view {
    margin: 16px;
}

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