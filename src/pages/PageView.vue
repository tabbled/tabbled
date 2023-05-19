<template>
    <div class="page-view" ref="page">
        <el-page-header ref="mainHeader" style="padding: 16px" @back="$router.back()">
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

        <el-form ref="grid"  class="grid-wrap" :model="editEntity" label-position="top">

            <el-form-item v-for="(element, idx) in elements"
                          :label="getLabelElement(element)"
                          :style="getGridElementStyle(element.layout)"

                          class="element">

                <component :id="element.id || idx.toString()"
                           :is="element.name"
                           v-bind="element.props"
                           :fieldConfig="getField(element)"
                           :model-value="getValue(element)"
                           @change="(value) => setValue(element, value)"
                           :context="scriptContext"
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
import {generateEntityWithDefault} from "../model/field";
import {useSettings} from "../services/settings.service";
import {Filters, useFilters} from "../model/filter";

let store = useStore();
let router = useRouter();
let route = useRoute();
const pageService = usePageScriptHelper(router)
const scriptContext = ref({
    pages: pageService,
    page: {
        params: {}
    },
    item: null
})

const pageHeader = usePageHeader()

let elements = ref<Array<ElementInterface>>([])
let page = ref(null)
let isEditPage = ref(false)
let componentService = useComponentService()
let dsService = useDataSourceService()
let settings = useSettings()
let elems = ref([])

let editEntity = ref<EntityInterface>(null)
let editDataSource: DataSourceInterface = null
let update = ref(0)
let isNew = ref(false)
let filters = ref<Filters>(null)

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

watch(() => editEntity.value,
    async () => {
        //console.log('update entity', editEntity.value)
    }, {deep: true})

onMounted(async () => {
    await init()
    setAppTitle()
})


function setAppTitle() {
    document.title = `${route.meta.title} | ${ settings.title }`
}

async function save() {
    try {
        if (isNew.value) {
            await editDataSource.insert(editEntity.value.id, editEntity.value)
        } else {
            await editDataSource.updateById(editEntity.value.id, editEntity.value)
        }

        ElMessage.success('Saved successfully')
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function loadValue(field) {
    if (!editEntity.value) {
        return null
    }
    return editEntity.value[field]
}

function getValue(el: ElementInterface) {
    //console.log('getValue', el.field, editEntity.value[el.field])
    if (editEntity.value)
        return editEntity.value[el.field]

    return undefined
}

async function setValue(el:ElementInterface, value: any) {
    //console.log('setValue', el, value)

    if (isEditPage.value) {
        if (!editEntity.value)
            return false

        editEntity.value[el.field] = value
        update.value++

        let fSetValue = await editDataSource.getFieldByAlias(el.field).setValueFunc()
        if (fSetValue) {
            return await fSetValue.exec(scriptContext.value)
        }
    } else if (filters.value) {
        if (!el.id) {
            console.warn("Filter component doesn't have correct id")
            return false
        }
    }
}

function getField(el:ElementInterface) {
    if (!editDataSource) {
        return undefined
    }
    return editDataSource.getFieldByAlias(el.field)
}


async function cancel() {
    router.back();
}

function setComponentAvailableHeight() {
    for(let i in elements.value) {
        let item = elements.value[i]
        if (item.props.fillHeight) {
            item.props.height = page.value.clientHeight - 16
        }
    }
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
    editDataSource = null
    editEntity.value = null

    scriptContext.value.page.params = route.params

    if (props.pageConfig.datasource) {
        editDataSource = await dsService.getByAlias(props.pageConfig.datasource)
        if (!editDataSource) {
            console.warn(`DataSource ${props.pageConfig.datasource} for editing page ${props.pageConfig.alias} not found`)
            return;
        }

        filters = useFilters(editDataSource)

        let id = <string>route.params.id

        if (id && id !== 'new') {
            editEntity.value = await editDataSource.getById(id)
            isNew.value = false
        } else {
            editEntity.value = await generateEntityWithDefault(editDataSource.fields)
            isNew.value = true
        }
    }

    props.pageConfig.elements.forEach(element => {
        let el:ElementInterface = {
            id: element.id,
            layout: element.layout,
            name: element.name,
            field: element.field,
            props: {},
            filterable: element.filterable
        }

        let elProps = componentService.getByName(el.name)
        if (!elProps) {
            console.warn(`Component "${el.name}" not registered`)
            return;
        }

        elProps.properties.forEach(item => {
            el.props[item.alias] = _.cloneDeep(element[item.alias])


        })
        el.props['context'] = scriptContext.value

        if (elProps.filterable || elProps.group === 'Filters') {
            el.props['filters'] = filters
        }

        if (elProps.properties)

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

    scriptContext.value.item = editEntity.value

    if (actions.value.onOpen) {
        await execAction(actions.value.onOpen)
    }

    setComponentAvailableHeight()
}

function getLabelElement(el) {
    if (el.props && el.props['title'] && el.props['title'] !== "") {
        return el.props['title'].toString()
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
    height: inherit;
}

.grid-wrap {
    margin: 16px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 10px;
    grid-auto-rows: minmax(20px, auto);
    grid-auto-flow: dense
}

.element {
    height: 20px;
    width: 100%;
    margin-bottom: 0 !important;
}

</style>