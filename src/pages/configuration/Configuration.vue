<template>
    <el-page-header style="padding: 16px;" @back="$router.back()" >
        <template #content>
            <span> {{$t('configuration')}} </span>
        </template>
        <template #extra >
            <div style="display: flex; align-self: center;">
                <el-dropdown
                    style="margin-right: 24px; "
                >
                <span class="dropdown-link">
                            {{$t('import')}}
                           <Icon width="16" style="padding-left: 4px" icon="ic:outline-file-download"></Icon>
                </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="loadConfigFile">{{$t('configuration')}}</el-dropdown-item>
                            <el-dropdown-item @click="loadDataFile">{{$t('importData')}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <el-dropdown
                    style="margin-right: 8px"
                >
                <span class="dropdown-link">
                            {{$t('export')}}
                           <Icon width="16" style="padding-left: 4px" icon="ic:outline-file-upload"></Icon>
                </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="exportConfig">{{$t('configuration')}}</el-dropdown-item>
                            <el-dropdown-item @click="exportData">{{$t('exportData')}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

        </template>
    </el-page-header>

    <el-tabs ref="tabsEl" tab-position="top" style="height: calc(100% - 128px); padding-left: 16px; padding-right: 16px" v-model="activeTab" @tab-change="tabChange">

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
    <el-dialog class="dialog"
               :model-value="importConfigSettingsVisible"
               style="padding: 16px"
               @close="importConfigSettingsVisible = false"
               :title="t('Import')"
               :modal="true"
               draggable
               :width="'60%'"
               :append-to-body="true"

    >
        <div style="display: flex; flex-direction: column; margin-left: 24px">
            <el-checkbox  v-model="importEntireConfig">Import entire config</el-checkbox>
            <el-text v-if="importEntireConfig"
                     class="mx-1"
                     type="warning"
                     style="margin-right: 16px; align-self: flex-start;"
            >
                Current config while be replaced
            </el-text>
        </div>
        <el-tree v-if="!importEntireConfig"
                 ref="configTree"
                 :data="importConfigData"
                 node-key="key"
                 :props="treeProps"
                 show-checkbox
                 check-on-click-node
        >
        </el-tree>
        <template #footer>
            <span>
                <el-text class="mx-1" style="margin-right: 16px;  ">{{'Version: ' +  importConfigVersion + '; rev: ' + importConfigRev}}</el-text>
                <el-button @click="importConfigSettingsVisible = false">{{$t('cancel')}}</el-button>
                <el-button type="primary" @click="importConfig">{{$t('import')}}</el-button>
            </span>
        </template>
    </el-dialog>
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

const { t } = useI18n();
const server = useSocketClient()

let configTree = ref(null)
let importConfigVersion = ref(null)
let importConfigRev = ref(null)
let importConfigData = ref(null)
let importConfigSettingsVisible = ref(false)
let importEntireConfig = ref(true)
let importConfigFile = null

const treeProps = {
    children: 'children',
    label: 'label',
    disabled: 'disabled'
}

let menuEntity = ref([])


let tabsEl = ref(null)
const { height } = useElementSize(tabsEl)

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
    document.title = `${t('configuration')} | ${ window['env']['appTitle'] }`
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


function loadFile() : Promise<any> {
    return new Promise( (resolve) => {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _ => {
            let files =   Array.from(input.files);
            const fr = new FileReader();
            fr.readAsText(files[0]);
            fr.addEventListener('load', (e) => {
                resolve(e.target.result)
            })
        };
        input.click();
    })
}

function prepareConfigTree(config) {
    if (!config.version || !config.rev)
        return null

    importConfigVersion.value = config.version
    importConfigRev.value = config.rev

    return [
        prepareItem('page',t('pages')),
        prepareItem('datasource',t('datasources')),
        prepareItem('function',t('functions')),
        prepareItem('report',t('reportTemplates')),
        {
            key: 'params',
            label: t('params')
        }
    ]

    function prepareItem(alias, title) {
        let item = {
            key: alias,
            label: title,
            children: [],
            disabled: false
        }

        if (config[alias] && Array.isArray(config[alias])) {
            for(const i in config[alias]) {
                let it = config[alias][i]
                item.children.push({
                    key: `${it.alias}.${it.data.alias}`,
                    label: `${it.data.title} (${it.data.alias})`,
                })
            }
        }

        item.disabled = !item.children.length


        return item
    }
}

function loadConfigFile() {
    loadFile().then(data => {
        importConfigFile = JSON.parse(data.toString())
        importConfigData.value = prepareConfigTree(importConfigFile)

        if (!importConfigData.value) {
            ElMessage.error('Config is not valid')
            return
        }

        importConfigSettingsVisible.value = true
    })
}

function loadDataFile() {
    loadFile().then(data => {
        importData(JSON.parse(data.toString()))
    })
}

async function importConfig(config: any) {
    console.log('Start load configuration with version ' + config.version)
    //console.log(configTree.value.getCheckedKeys())
    try {
        await server.emit('config/import', {
            entire: importEntireConfig.value,
            entities: !importEntireConfig.value ? configTree.value.getCheckedKeys() : undefined,
            config: importConfigFile
        })
        console.log("Loading configuration have finished. Reload the page")
        ElMessage.success('Imported successfully')
    } catch (e) {
        console.error(e)
        ElMessage.error('Import error')
    }
}

async function importData(data: any) {
    try {
        //await sync.import(DataSourceType.data, data)
        console.log("Loading data have finished.", data)
        ElMessage.success('Imported successfully')
    } catch (e) {
        console.error(e)
        ElMessage.error('Import error')
    }
}

function saveFile(data: any, filename: string) {
    let file = new Blob([data]);
    let a = document.createElement("a"),
        url = URL.createObjectURL(file)

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

async function exportConfig() {
    let config = await server.emit('config/export', {})
    saveFile(JSON.stringify(config), 'configuration.json')
}

async function exportData() {
    let data = JSON.stringify(await gatherData(), null, 4)
    saveFile(data, 'data.json')
}

async function gatherData() {
    let data = {}
    let sources = dsService.dsDataSource.getMany()
    for(const i in sources) {
        const source = sources[i]
        data[source.alias] = await gatherFromDataSource(source.alias)
    }

    return data
}

async function gatherFromDataSource(alias: string) {
    let ds = await dsService.getByAlias(alias)
    if (!ds)
        return undefined;

    return []
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