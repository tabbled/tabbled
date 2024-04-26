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

                    <el-dropdown v-if="reportMenu.length"
                        style="margin-right: 24px; "
                    >
                        <el-button type="primary">
                            {{$t('print')}}
                            <Icon width="16" style="padding-left: 4px" icon="material-symbols:keyboard-arrow-down"/>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>

                                <el-dropdown-item v-for="rep in reportMenu" @click="generateReport(rep.id)">
                                    {{rep.title}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <el-button v-if="isEditPage" @click="cancel">{{$t('cancel')}}</el-button>
                    <el-button v-if="isEditPage"
                               @click="save"
                               type="primary"
                    >{{$t('save')}}</el-button>
                </div>
            </template>
        </el-page-header>

        <el-form v-if="pageConfig && pageConfig.templateType === 'grid'"
                 ref="grid"  class="grid-wrap" :model="editEntity" label-position="top">

            <el-form-item v-for="(element, idx) in elements.filter(el => el.isVisible === true )"
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

        <FlexLayoutPage v-if="pageConfig && pageConfig.templateType === 'flex'"
                        id="flex"
                        :screen-size="screenSize"
                        :page-config="pageConfig"
                        :elements="elements"
                        mode="view"
                        :context="scriptContext"
                        @update:field-value="(element, value) => setValue(element, value)"
        />
    </div>
</template>

<script setup lang="ts">

import _ from 'lodash'
import {onMounted, watch, ref} from "vue";
import {ScreenSize, PageConfigInterface, PositionElementInterface, ElementInterface} from "../model/page";
import {useRouter, useRoute} from 'vue-router';
import {usePageScriptHelper, usePageHeader} from "../services/page.service";
import {CompiledFunc, compileScript} from "../services/compiler";
import {ElMessage} from "element-plus";
import {useComponentService} from "../services/component.service";
import {CustomDataSource, DataSource, DataSourceInterface, EntityInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
import {generateEntityWithDefault} from "../model/field";
import {useSettings} from "../services/settings.service";
import {Filters, useFilters} from "../model/filter";
import FlexLayoutPage from "../components/FlexLayoutPage.vue";
import {useI18n} from 'vue-i18n'
import {useSocketClient} from "../services/socketio.service";
const { t } = useI18n();

let router = useRouter();
let route = useRoute();
const pageService = usePageScriptHelper(router)


const pageHeader = usePageHeader()

let elements = ref<Array<ElementInterface>>([])
let page = ref(null)
let isEditPage = ref(false)
let componentService = useComponentService()
let dsService = useDataSourceService()
let settings = useSettings()
let elems = ref([])
let reportMenu = ref([])
const socket = useSocketClient()


let editEntity = ref<EntityInterface>(null)
let editEntityRevisionId = -1
let isSaving = false
let editDataSource: DataSourceInterface = null
let isNew = ref(false)
let filters = ref<Filters>(null)
let visibleElements = ref([])
for(let i = 0; i < 12; i++) visibleElements.value.push([])

const props = defineProps<{
    pageConfig: PageConfigInterface,
    screenSize: ScreenSize,
    openDialog: Function
}>()

const scriptContext = ref({
    pages: pageService,
    page: {
        params: {}
    },
    item: null,
    openDialog: null,
    message: ElMessage
})

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
    document.title = `${route.meta.title} | ${ window['env']['appTitle'] ? window['env']['appTitle'] : 'Tabbled' }`
}

async function save() {
    try {
        isSaving = true
        if (isNew.value) {
            let item = await editDataSource.insert(editEntity.value.id, editEntity.value)

            await router.replace({ params: { id: item.id }})
            await init()
        } else {
            await editDataSource.updateById(editEntity.value.id, editEntity.value)
        }
        await updateRevision()
        isSaving = false

        ElMessage.success(t('saved'))
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
        isSaving = false
    }
}

async function loadValue(field) {
    if (!editEntity.value) {
        return null
    }
    return editEntity.value[field]
}

async function generateReport(id) {
    try {

        let rep = await socket.emit('reports/renderById', {
            id: id,
            context: {
                item: scriptContext.value.item,
                page: scriptContext.value.page
            }
        })

        const objectUrl = window.URL.createObjectURL(new Blob([rep], {type: 'application/pdf'}));
        window.open(objectUrl)
        URL.revokeObjectURL(objectUrl)
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

function getValue(el: ElementInterface | any) {
    if (editEntity.value)
        return editEntity.value[el.field]

    return undefined
}

function getVisible(el) {
    console.log('getVisible', el)
    return true
}


async function processVisibleAllElements() {

    for(let i in elements.value) {
        let el = elements.value[i]
        await processVisible(el)
    }
}

async function processVisible(element: ElementInterface | any) {
    if (element.visibleFunc) {
        let val = await element.visibleFunc.exec(scriptContext.value)
        element.isVisible = val === undefined || val === null ? true : val
    } else if (element.elements) {
        for(let i in element.elements) {
            await processVisible(element.elements[i])
        }
    }
}

async function setValue(el:ElementInterface | any, value: any) {
    //console.log(el, value)
    if (isEditPage.value) {
        if (!editEntity.value)
            return false

        await setEntityValue(el.field, value)
    } else if (filters.value) {
        if (!el.id) {
            console.warn("Filter component doesn't have correct id")
            return false
        }
    }

    await processVisibleAllElements()
}

async function setEntityValue(alias, value) {
    editEntity.value[alias] = value

    let fSetValue = await editDataSource.getFieldByAlias(alias).setValueFunc()
    if (fSetValue) {
        return await fSetValue.exec(scriptContext.value)
    }
}

function getField(el:ElementInterface | any) {
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
            item.props.height = page.value.clientHeight - 40
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
    scriptContext.value.openDialog = props.openDialog
    scriptContext.value.message = ElMessage

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

            await updateRevision()
        } else {
            editEntity.value = await generateEntityWithDefault(editDataSource.fields)
            isNew.value = true
            editEntityRevisionId = -1
        }

        scriptContext.value.item = editEntity.value

        // Need to set data of table fields to those datasource
        if (editDataSource) {
            for (let i in editDataSource.fields) {
                let f = editDataSource.fields[i]
                if (f.type === 'table') {
                    let ds = await dsService.getByAlias(f.datasource)
                    if (!ds) {
                        console.warn(`DataSource ${f.datasource} for field ${f.alias} not found`)
                        continue
                    }

                    if (ds instanceof CustomDataSource)
                        ds.setContext(scriptContext.value)

                    ds.removeAllListeners('update')
                    ds.removeAllListeners('item-updated')
                    ds.removeAllListeners('item-inserted')
                    ds.removeAllListeners('item-removed')

                    await ds.setData(editEntity.value[f.alias])

                    ds.on('update', async () => {
                        await setEntityValue(f.alias, (await ds.getMany()).data)
                    })
                    ds.on('item-updated', async () => {
                        await setEntityValue(f.alias, (await ds.getMany()).data)
                    })
                    ds.on('item-inserted', async () => {
                        await setEntityValue(f.alias, (await ds.getMany()).data)
                    })
                    ds.on('item-removed', async () => {
                        await setEntityValue(f.alias, (await ds.getMany()).data)
                    })
                }
            }
        }
    }

    elements.value = processElements(props.pageConfig.elements)

    setComponentAvailableHeight()

    pageHeader.actions = []

    for (let i in props.pageConfig.headerActions) {
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

    if (actions.value.onOpen) {
        await execAction(actions.value.onOpen)
    }

    reportMenu.value = []
    let reports = (await dsService.reportDataSource.getMany({
        fields: ['title', 'pages']
    })).data

    for (let i in reports) {
        let rep = reports[i]

        if (rep.pages && rep.pages.includes(props.pageConfig.alias)) {
            reportMenu.value.push({
                id: rep.id,
                title: rep.title
            })
        }
    }

    socket.socket.off('updates', onUpdates)
    if (isEditPage.value){
        socket.socket.on('updates', onUpdates)
    }

    await processVisibleAllElements()
}

function processElements(elements): ElementInterface[] {
    let els = []
    elements.forEach(element => {
        let el: ElementInterface = {
            id: element.id,
            layout: element.layout,
            name: element.name,
            field: element.field,
            props: {},
            filterable: element.filterable,
            fieldConfig: getField(element),
            elements: [],
            fieldValue: undefined,
            isVisible: true
        }

        let elProps = componentService.getByName(el.name)
        if (!elProps) {
            console.warn(`Component "${el.name}" not registered`)
            return;
        }

        elProps.properties.forEach(item => {
            el.props[item.alias] = _.cloneDeep(element[item.alias])

            if (item.alias === 'visible' && element['visible']) {
                console.log('visible!', element['visible'].script)
                el.visibleFunc = compileScript(element['visible'].script, 'ctx')
            }
        })
        el.props['context'] = scriptContext.value

        if (elProps.filterable || elProps.group === 'Filters') {
            el.props['filters'] = filters
        }

        if (element.elements)
            el.elements = processElements(element.elements)

        el.fieldValue = getValue(el)

        els.push(el)
    })

    return els
}

async function updateRevision() {
    editEntityRevisionId = await (editDataSource as DataSource).getCurrentRevisionId(editEntity.value.id)
}

async function onUpdates(msg: any) {
    if (isSaving)
        return

    if (!msg || msg.type !== 'data' || !msg.entity
        || msg.entity.alias !== editDataSource.alias)
        return

    if (msg.entity.id === editEntity.value.id
        && editEntityRevisionId !== msg.entity.rev) {
        ElMessage.warning({
            message: t('entityUpdated'),
            duration: 0,
            showClose: true,
            grouping: true
        })
    }
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
        return compileScript(action.script, 'ctx')
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
    grid-auto-flow: column;

}

.element {
    height: 20px;
    width: 100%;
    margin-bottom: 0 !important;
}

</style>