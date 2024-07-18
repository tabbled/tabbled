<template>
    <div class="page-view" ref="page">
        <el-page-header ref="mainHeader" style="padding: 16px" @back="$router.back()">
            <template #content>
                <div style="align-items: center; display: flex">
                    <div > {{route.meta.title}} </div>
                    <el-tooltip
                        :content="$t('revisions')"
                        placement="right"
                        effect="light"
                        trigger="hover"
                        :hide-after="0"
                        :show-after="500"
                        :virtual-ref="revisionBtn"
                    />
                    <el-dropdown ref="revisionBtn" v-if="isEditPage && editEntityRevisionId !== -1" max-height="300" trigger="click"
                                 style="margin-left: 12px;"
                    >
                        <el-button :type="currentRevision && currentRevision.id !== editEntityRevisionId ? 'danger' : 'info'"
                                   link @click="getRevisions">
                            <Icon width="16" style="padding-left: 4px" icon="material-symbols:history"/>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="rev in revisions" @click="setRevision(rev)">
                                    <div style="width: 30px; align-items: center; display: flex">
                                        <Icon v-if="currentRevision.id === rev.id" width="16" style="padding-left: 4px" icon="material-symbols:check"/>
                                    </div>
                                    ({{rev.version}}) {{rev.createdAt}} - {{rev.createdBy}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>

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

                    <el-button v-if="isEditPage"
                               :disabled="!canUpdate"
                               @click="cancel">
                        {{$t('cancel')}}
                    </el-button>
                    <el-button v-if="isEditPage" :disabled="!canUpdate"
                               @click="save"
                               type="primary">
                        {{$t('save')}}
                    </el-button>
                </div>
            </template>

        </el-page-header>
        <el-alert v-if="isEditPage && currentRevision && currentRevision.id !== editEntityRevisionId"
                  type="warning"
                  :closable="false"
                  style="border-radius: 0;"
                  show-icon
        >
                ({{currentRevision.version}}) {{currentRevision.createdAt}} - {{currentRevision.createdBy}}
        </el-alert>
        <div  style="font-size: 0.8em">

        </div>
        <el-form v-if="pageConfig" :disabled="!canUpdate"
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
                           @update:selected="selectedChanged"
                           :disabled="!canUpdate || element.props.disabled"

                />
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">

import _ from 'lodash'
import {onMounted, watch, ref} from "vue";
import {ScreenSize, PageConfigInterface, PositionElementInterface, ElementInterface} from "../model/page";
import {useRouter, useRoute, onBeforeRouteLeave} from 'vue-router';
import {usePageScriptHelper, usePageHeader} from "../services/page.service";
import {CompiledFunc, compileScript} from "../services/compiler";
import {ElMessage, ElMessageBox} from "element-plus";
import {useComponentService} from "../services/component.service";
import {CustomDataSource, DataSource, DataSourceInterface, EntityInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
import {generateEntityWithDefault} from "../model/field";
import {useSettings} from "../services/settings.service";
import {Filters, useFilters} from "../model/filter";
import {useI18n} from 'vue-i18n'
import {useSocketClient} from "../services/socketio.service";
import {hasPermission} from "../model/permissions";
import store from "../store";
import {useApiClient} from "../services/api.service";
import dayjs from "dayjs";
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
let reportMenu = ref([])
const socket = useSocketClient()
let revisions = ref([])
let currentRevision = ref(null)
let revisionBtn = ref(null)


let editEntity = ref<EntityInterface>(null)
let editEntityRevisionId = -1
let isSaving = false
let editDataSource: DataSourceInterface = null
let isNew = ref(false)
let filters = ref<Filters>(null)
let visibleElements = ref([])
for(let i = 0; i < 12; i++) visibleElements.value.push([])
let selected = ref<string[]>([])
let canUpdate = ref(false)
let isChanged = ref(false)
let isLoading = ref(false)
let api = useApiClient()

const props = defineProps<{
    pageConfig: PageConfigInterface,
    screenSize: ScreenSize,
    openDialog: Function
}>()

const scriptContext = ref({
    pages: pageService,
    page: {
        params: {},
        alias: "",
        path: "",
        isEditPage: false,
        id: "",
        title: ""
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
    if (!isNew.value && currentRevision.value.id !== editEntityRevisionId) {
        ElMessageBox.confirm(
            t('confirmSaveRevision'),
            t('saveRevision'),
            {
                confirmButtonText: t('save'),
                cancelButtonText: t('cancel'),
                type: 'warning',
            }
        )
            .then(async () => {
                await saveData()
            })
    } else {
        await saveData()
    }

    async function saveData() {
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
            currentRevision.value = {
                id: editEntityRevisionId
            }
            isChanged.value = false
            await setViewed()

            ElMessage.success(t('saved'))
        }catch (e) {
            ElMessage.error(e.toString())
            console.error(e)
        } finally {
            isSaving = false
        }
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
                page: scriptContext.value.page,
                selected: selected.value,
                filters: filters.value.filters
            }
        })

        const objectUrl = window.URL.createObjectURL(new Blob([rep.report], {type: `${rep.contentType}`}));

        if (rep.contentType === 'application/pdf') {
            window.open(objectUrl)
        } else {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute('style',"display: none")
            a.href = objectUrl
            a.download = rep.filename
            a.click()
            URL.revokeObjectURL(objectUrl)
        }



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
    isChanged.value = true
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
    revisions.value = []
    currentRevision.value = null
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

    scriptContext.value.page = {
        params: route.params,
        alias: props.pageConfig.alias,
        path: props.pageConfig.path,
        isEditPage: props.pageConfig.isEditPage,
        id: props.pageConfig.id,
        title: props.pageConfig.title
    }
    scriptContext.value.openDialog = props.openDialog
    scriptContext.value.message = ElMessage

    if (props.pageConfig.datasource) {
        editDataSource = await dsService.getByAlias(props.pageConfig.datasource)
        if (!editDataSource) {
            console.warn(`DataSource ${props.pageConfig.datasource} for editing page ${props.pageConfig.alias} not found`)
            return;
        }


        canUpdate.value = props.pageConfig.isEditPage
            ? editDataSource.hasPermission('Edit', store.getters['auth/account'].permissions)
            : true


        filters = useFilters(editDataSource)
        let state = localStorage.getItem(`${props.pageConfig.id}_filters_state`)
        if (state) {
            filters.value.restoreState(JSON.parse(state))
        }
        watch(() => filters.value.filters, () => {
            localStorage.setItem(`${props.pageConfig.id}_filters_state`, JSON.stringify(filters.value.backupState()))
        }, {
            deep: true
        })

        let id = <string>route.params.id

        if (id && id !== 'new') {
            editEntity.value = await editDataSource.getById(id)
            isNew.value = false

            await updateRevision()
            currentRevision.value = {
                id: editEntityRevisionId
            }
            setViewed()
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
        fields: ['title', 'pages', 'permissions']
    })).data

    for (let i in reports) {
        let rep = reports[i]

        if (rep.pages && rep.pages.includes(props.pageConfig.alias)
            && hasPermission(rep, 'View', store.getters['auth/account'].permissions)) {
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

    isLoading.value = false
    isChanged.value = false
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

async function setViewed() {
    await socket.emit('dataSources/setViewed', {
        itemId: editEntity.value.id
    })
}

function selectedChanged(sl) {
    selected.value = sl
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

const getRevisions = async () => {
    const res = await api.get(`/v2/datasource/${editDataSource.alias}/data/${editEntity.value.id}/revision`)

    revisions.value = res.data.items.map(i => {
        return {
            id: i.id,
            version: `v${i.version}`,
            createdAt: dayjs(i.createdAt).format('DD.MM.YYYY HH:mm:ss'),
            createdBy: i.createdBy.id ? `${i.createdBy.title} (${i.createdBy.username})` : t('system')
        }
    })
}

const setRevision = async (rev) => {

    if (isChanged.value) {
        ElMessageBox.confirm(
            t('confirmOpenRevision'),
            t('openRevision'),
            {
                confirmButtonText: t('open'),
                cancelButtonText: t('cancel'),
                type: 'warning',
            }
        )
            .then(async () => {
                await setRev()
            })
    } else
        await setRev()


    async function setRev() {
        try {
            const res = await api.get(`/v2/datasource/${editDataSource.alias}/data/${editEntity.value.id}/revision/${rev.id}`)
            //console.log()
            editEntity.value = res.data.data
            currentRevision.value = rev

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

                    await ds.setData(editEntity.value[f.alias])
                }
            }
            isChanged.value = false

        } catch (e) {
            ElMessage.error(e.toString())
            console.error(e)
        }
    }
}

onBeforeRouteLeave(() => {
    if (isChanged.value) {
        const answer = window.confirm(t('leaveWithoutSavingWarn'))
        if (!answer) return false
    }
    return true
})


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
    padding-bottom: 16px;

}

.element {
    height: 20px;
    width: 100%;
    margin-bottom: 0 !important;
}

</style>