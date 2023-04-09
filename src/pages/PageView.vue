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
                    <el-button v-if="isEditPage" @click="cancel">Cancel</el-button>
                    <el-button v-if="isEditPage"
                               @click="save"
                               type="primary"
                    >Save</el-button>
                </div>
            </template>
        </el-page-header>

        <el-form  class="grid-wrap" :model="editEntity" label-position="top">

            <el-form-item v-for="(element, idx) in elements"
                          :label="getLabelElement(element)"
                          :style="getGridElementStyle(element.layout)"
                          class="element">

                <component :id="element.id || idx.toString()"
                           style="width: 100%"
                           :is="element.name" v-bind="element"
                           :fieldConfig="getField(element)"
                           :modelValue="getValue(element)"
                           @change="(value) => setValue(element, value)"
                           :context="scriptContext"
                           :update="update"

                />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">

import _ from 'lodash'
import {useStore} from "vuex"
import {onMounted, watch, ref} from "vue";
import {ScreenSize, PageConfigInterface, PositionElementInterface, ElementInterface} from "../model/page";
import {useRouter, useRoute} from 'vue-router';
import {usePageScriptHelper, usePageHeader} from "../services/page.service";
import {CompiledFunc, compileScript} from "../services/compiler";
import {ElMessage} from "element-plus";
import {useComponentService} from "../services/component.service";
import {DataSourceInterface, EntityInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";

let store = useStore();
let router = useRouter();
let route = useRoute();
const pageService = usePageScriptHelper(router)
const scriptContext = ref({
    pages: pageService,
    page: {
        params: {}
    }
})

const pageHeader = usePageHeader()

let elements = ref<Array<ElementInterface>>([])
let grid = ref(null)
let isEditPage = ref(false)
let componentService = useComponentService()
let dsService = useDataSourceService()

let editEntity = ref<EntityInterface>(null)
let editDataSource = ref<DataSourceInterface>(null)
let update = ref(0)

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
        setAppTitle()
    })

onMounted(async () => {
    await init()
    setAppTitle()
})

function setAppTitle() {
    // @ts-ignore
    let appTitle = import.meta.env.VITE_APP_TITLE ? import.meta.env.VITE_APP_TITLE : 'Tabbled'
    document.title = `${route.meta.title} | ${ appTitle }`
}

async function save() {
    try {
        //await editingDataSet.value.commit()

        ElMessage.success('Saved successfully')
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function getValue(el: ElementInterface) {
    //console.log('getValue', el)
    if (!editEntity.value) {
        return null
    }
    return editEntity.value[el.field]
}

async function setValue(el:ElementInterface, value: any) {
    //console.log('setValue', el, value)
    if (!editEntity.value) {
        return false
    }
    editEntity.value[el.field] = value
}

function getField(el:ElementInterface) {
    if (!editDataSource.value) {
        return undefined
    }
    let f = editDataSource.value.getFieldByAlias(el.field)

    if (!f) {
        console.error(`Field ${el.field} for page element ${el.name} not found in datasource ${props.pageConfig.datasource}`)
    }
    return f
}


async function cancel() {
    console.log('cancel')
    //
    // if (editingDataSet.value && editingDataSet.value.isChanged()) {
    //     editingDataSet.value.rollback()
    // }

    router.back();
}

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

    isEditPage.value = props.pageConfig.isEditPage;

    actions.value.onOpen = await compileAction(props.pageConfig.onOpen)

    elements.value = []
    editDataSource.value = null
    editEntity.value = null

    scriptContext.value.page.params = route.params

    props.pageConfig.elements.forEach(element => {
        let el:ElementInterface = {
            id: element.id,
            layout: element.layout,
            name: element.name,
            field: element.field
        }



        let elProps = componentService.getByName(el.name)
        if (!elProps) {
            console.warn(`Component "${el.name}" not registered`)
            return;
        }

        elProps.properties.forEach(item => {
            el[item.alias] = _.cloneDeep(element[item.alias])
        })
        //el['context'] = scriptContext.value
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

    if (props.pageConfig.isEditPage && props.pageConfig.datasource) {
        editDataSource.value = dsService.getDataSourceByAlias(props.pageConfig.datasource)
        if (!editDataSource.value) {
            console.warn(`DataSource ${props.pageConfig.datasource} for editing page ${props.pageConfig.alias} not found`)
            return;
        }
        let id = <string>route.params.id
        if (id) {
            editEntity.value = await editDataSource.value.getById(id)
        } else {
            editEntity.value = {}
        }
    }

    update.value += 1

    console.log('editEntity', editEntity.value)

    if (actions.value.onOpen) {
        await execAction(actions.value.onOpen)
    }
}

function getLabelElement(el) {
    if (el['title'] && el['title'] !== "") {
        return el['title'].toString()
    }
    return ""
}

async function compileAction(action) {
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
        let ctx = Object.assign(scriptContext.value, additionalContext)
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
    margin-bottom: 0 !important;
}

</style>