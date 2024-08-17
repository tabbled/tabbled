<template>
    <div style="display: flex; flex-direction: column; width: 100%">


    <el-page-header style="padding: 16px;" @back="$router.back()" >
        <template #content>
            <span> {{$t('configuration')}} </span>
        </template>
        <template #extra >
            <el-button type="text" @click="importDialogVisible = true" style="margin-right: 8px">
                <Icon width="16" style="margin-right: 8px" icon="ic:outline-file-download"></Icon>
                {{$t('import')}}
            </el-button>
            <el-button type="text" @click="exportDialogVisible = true" style="margin-right: 16px">
                <Icon width="16" style="margin-right: 8px" icon="ic:outline-file-upload"></Icon>
                {{$t('export')}}
            </el-button>
        </template>
    </el-page-header>

    <el-tabs ref="tabsEl" tab-position="top" style="height: calc(100% - 150px); padding-left: 16px; padding-right: 16px" v-model="activeTab" @tab-change="tabChange">

        <el-tab-pane :label="$t('pages')"  name="pages" style="height: inherit">
            <Table :columns="pagesColumns"
                   id="pages"
                   datasource="page"
                   :context="{}"
                   @row-dbl-click="editPage"
                   :readonly="true"
                   :on-click-add="addPage"
                   :filters-visible="false"
                   :height="height ? height : 500"
            />
        </el-tab-pane>

        <el-tab-pane :label="$t('datasources')" name="datasources" style="height: inherit">
            <Table :columns="dsColumns"
                   id="ds"
                   :context="{}"
                   datasource="datasource"
                   :readonly="true"
                   @row-dbl-click="editDataSource"
                   :on-click-add="addDataSource"
                   :filters-visible="false"
                   :height="height ? height : 500"

            />
        </el-tab-pane>

        <el-tab-pane :label="$t('functions')" name="functions">
            <Table :columns="funcColumns"
                   id="func"
                   :context="{}"
                   datasource="function"
                   @row-dbl-click="editFunc"
                   :readonly="true"
                   :on-click-add="addFunc"
                   :filters-visible="false"
                   :height="height ? height : 500"
            />
        </el-tab-pane>

        <el-tab-pane :label="$t('reportTemplates')" name="reports">

            <Table :columns="reportColumns"
                   id="reps"
                   :context="{}"
                   datasource="report"
                   @row-dbl-click="editReport"
                   :readonly="true"
                   :on-click-add="addReport"
                   :filters-visible="true"
                   :height="height ? height : 500"
            />

        </el-tab-pane>

        <el-tab-pane :label="$t('users')" name="users">

            <Table :columns="usersColumns"
                   id="users"
                   :context="{}"
                   datasource="users"
                   @row-dbl-click="editUser"
                   :readonly="true"
                   :on-click-add="addUser"
                   :filters-visible="true"
                   :height="height ? height : 500"
            />

        </el-tab-pane>

        <el-tab-pane :label="$t('settings')" name="settings">
            <div style="display: flex; justify-content: end;">
                <el-button type="primary" @click="saveSettings">{{$t('save')}}</el-button>
            </div>

            <el-form label-position="top">
                <el-form-item :label="t('menu')">
                    <MenuEdit v-model:menuEntity="menuEntity"/>
                </el-form-item>
            </el-form>

        </el-tab-pane>

    </el-tabs>

    </div>

    <ImportDialog v-model:visible="importDialogVisible"></ImportDialog>
    <ExportDialog v-model:visible="exportDialogVisible"/>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Table from "../../components/Table.vue";
import {ColumnConfigInterface} from "../../model/column";
import {onMounted, ref} from "vue";
import {ScreenSize} from "../../model/page";
import {useDataSourceService} from "../../services/datasource.service";
import {ElMessage} from "element-plus";
import {useSettings} from "../../services/settings.service";
import {useI18n} from "vue-i18n";
import { useElementSize } from '@vueuse/core'
import { useSocketClient } from "../../services/socketio.service";
import MenuEdit from "./MenuEdit.vue";
import ExportDialog from "./ExportDialog.vue";
import ImportDialog from "./ImportDialog.vue";
import {usePage} from "../../store/pageStore";

const { t } = useI18n();
const server = useSocketClient()

let importDialogVisible = ref(false)
let exportDialogVisible = ref(false)

const treeProps = {
    children: 'children',
    label: 'label',
    disabled: 'disabled'
}

let menuEntity = ref([])


let tabsEl = ref(null)
const { height } = useElementSize(tabsEl)
const page = usePage()

const props = defineProps<{
    screenSize: ScreenSize
}>()

const route = useRoute()
const router = useRouter()
const dsService = useDataSourceService()
let activeTab = ref('')
const settings = useSettings()

const pagesColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": t('alias'),
        "width": 150,
        "sortable": true,
    },
    {
        "id": "2",
        "field": "title",
        "title": t('title'),
        "width": 350,
        "sortable": true
    }
]
const funcColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": t('alias'),
        "width": 150,
        "sortable": true
    },
    {
        "id": "2",
        "field": "title",
        "title": t('title'),
        "width": 200,
        "sortable": true
    }
]
const reportColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": t('alias'),
        "width": 150,
        "sortable": true
    },
    {
        "id": "2",
        "field": "title",
        "title": t('title'),
        "width": 200,
        "sortable": true
    }
]
const dsColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": t('alias'),
        "width": 150,
        "sortable": true
    },
    {
        "id": "2",
        "field": "title",
        "title": t('title'),
        "width": 200,
        "sortable": true
    },
    {
        "id": "3",
        "field": "source",
        "title": t('source'),
        "width": 200,
        "sortable": true,
    }
]
const usersColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "username",
        "title": t('username'),
        "width": 150,
        "sortable": true
    },{
        "id": "2",
        "field": "active",
        "title": t('active'),
        "width": 60,
        "sortable": true
    },{
        "id": "2",
        "field": "firstname",
        "title": t('firstname'),
        "width": 100,
        "sortable": true
    },{
        "id": "3",
        "field": "lastname",
        "title": t('lastname'),
        "width": 100,
        "sortable": true
    },{
        "id": "4",
        "field": "roles",
        "title": t('Roles'),
        "width": 250,
        "sortable": true
    }
]

function setAppTitle() {
    document.title = `${t('configuration')} | ${ window['env']['appTitle'] ? window['env']['appTitle'] : "Tabbled" }`
}

onMounted(async () => {
    activeTab.value = route.query.activeTab ? <string>route.query.activeTab : 'pages'
    await router.replace({path: '/configuration', query: {activeTab: activeTab.value}})

    let menu = await server.emit('config/params/get', {
        id: 'menu'
    })

    menuEntity.value = menu ? menu : []

    setAppTitle()
});

async function saveSettings() {
    try {
        await server.emit('config/params/set', {
            id: 'menu',
            value: menuEntity.value
        })
        ElMessage.success('Saved successfully')
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

function tabChange(d) {
    router.replace({path: '/configuration', query: {activeTab: d}})
    setAppTitle()
}

function addPage() {
    router.push(`/configuration/pages/new`)
}

function editPage(ctx) {
    router.push(`/configuration/pages/${ctx.id}`)
}

function addFunc() {
    router.push(`/configuration/functions/new`)
}

function editFunc(ctx) {
    router.push(`/configuration/functions/${ctx.id}`)
}

function addDataSource() {
    router.push(`/configuration/datasources/new`)
}

function editDataSource(ctx) {
    router.push(`/configuration/datasources/${ctx.id}`)
}

function addMenu() {
    router.push(`/configuration/menu/new`)
}

function editMenu(ctx) {
    router.push(`/configuration/menu/${ctx.id}`)
}

function addReport() {
    router.push(`/configuration/reports/new`)
}

function editReport(ctx) {
    router.push(`/configuration/reports/${ctx.id}`)
}

function addUser() {
    router.push(`/configuration/users/new`)
}

function editUser(ctx) {
    router.push(`/configuration/users/${ctx.id}`)
}

</script>

<style scoped>

.dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}
</style>