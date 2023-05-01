<template>
    <el-page-header style="padding: 16px;" @back="$router.back()">
        <template #content>
            <span> {{route.meta.title}} </span>
        </template>
        <template #extra >
            <div style="display: flex; align-self: center;">
                <el-dropdown
                    style="margin-right: 24px; "
                >
                <span class="dropdown-link">
                            Import
                           <Icon width="16" style="padding-left: 4px" icon="ic:outline-file-download"></Icon>
                </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="loadConfigFile">Config</el-dropdown-item>
                            <el-dropdown-item @click="loadDataFile">Data from *.json</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>

                <el-dropdown
                    style="margin-right: 8px"
                >
                <span class="dropdown-link">
                            Export
                           <Icon width="16" style="padding-left: 4px" icon="ic:outline-file-upload"></Icon>
                </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="exportConfig">Config</el-dropdown-item>
                            <el-dropdown-item @click="exportData">Data to *.json</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>

        </template>
    </el-page-header>

    <el-tabs tab-position="top" style="height: calc(100% - 64px); padding-left: 16px" v-model="activeTab" @tab-change="tabChange">

        <el-tab-pane label="Menus" name="menus">
            <Table :columns="menuColumns"
                   id="menu"
                   :context="{}"
                   datasource="menu"
                   @row-dbl-click="editMenu"
                   :readonly="true"
                   :on-click-add="addMenu"
            />
        </el-tab-pane>

        <el-tab-pane label="Pages"  name="pages">
            <Table :columns="pagesColumns"
                   id="pages"
                   datasource="page"
                   :context="{}"
                   @row-dbl-click="editPage"
                   :readonly="true"
                   :on-click-add="addPage"
            />
        </el-tab-pane>

        <el-tab-pane label="Data sources" name="datasources">
            <Table :columns="dsColumns"
                   id="ds"
                   :context="{}"
                   datasource="datasource"
                   :readonly="true"
                   @row-dbl-click="editDataSource"
                   :on-click-add="addDataSource"

            />
        </el-tab-pane>

        <el-tab-pane label="Functions" name="functions">
            <Table :columns="funcColumns"
                   id="func"
                   :context="{}"
                   datasource="function"
                   @row-dbl-click="editFunc"
                   :readonly="true"
                   :on-click-add="addFunc"
            />
        </el-tab-pane>

        <el-tab-pane label="Report templates" name="reports">
            Report templates coming soon
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Table from "../components/Table.vue";
import {ColumnConfigInterface} from "../model/column";
import {onMounted, ref} from "vue";
import {ScreenSize} from "../model/page";
import {useDataSourceService} from "../services/datasource.service";
import {useSyncService} from "../services/sync.service";
import {ElMessage} from "element-plus";
import {DataSourceType} from "../model/datasource";

const props = defineProps<{
    screenSize: ScreenSize
}>()

const route = useRoute()
const router = useRouter()
const dsService = useDataSourceService()
let activeTab = ref('')
let sync = useSyncService()

const pagesColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": "Page alias",
        "width": 150,
        "sortable": true,
    },
    {
        "id": "2",
        "field": "title",
        "title": "Title",
        "width": 350,
        "sortable": true
    }
]

const funcColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": "alias",
        "width": 150,
        "sortable": true
    },
    {
        "id": "2",
        "field": "title",
        "title": "Title",
        "width": 200,
        "sortable": true
    }
]
const dsColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": "alias",
        "width": 150,
        "sortable": true
    },
    {
        "id": "2",
        "field": "title",
        "title": "Title",
        "width": 200,
        "sortable": true
    },
    {
        "id": "3",
        "field": "source",
        "title": "Source",
        "width": 200,
        "sortable": true,
    }
]
const menuColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "title",
        "title": "Title",
        "width": 150,
        "sortable": true
    }
]

function setAppTitle() {
    // @ts-ignore
    let appTitle = import.meta.env.VITE_APP_TITLE ? import.meta.env.VITE_APP_TITLE : 'Tabbled'
    document.title = `Configuration | ${ appTitle }`
}

onMounted(async () => {
    activeTab.value = route.query.activeTab ? <string>route.query.activeTab : 'pages'
    await router.replace({path: '/configuration', query: {activeTab: activeTab.value}})

    setAppTitle()
});


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


function loadConfigFile() {
    loadFile().then(data => {
        importConfig(JSON.parse(data.toString()))
    })
}

function loadDataFile() {
    loadFile().then(data => {
        importData(JSON.parse(data.toString()))
    })
}

async function importConfig(config: any) {
    console.log('Start load configuration with version ' + config.version)

    try {
        await sync.import(DataSourceType.config, config)
        console.log("Loading configuration have finished. Reload the page")
        ElMessage.success('Imported successfully')
    } catch (e) {
        console.error(e)
        ElMessage.error('Import error')
    }
}

async function importData(data: any) {
    try {
        await sync.import(DataSourceType.data, data)
        console.log("Loading data have finished.")
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
    let data = JSON.stringify(await gatherConfig(), null, 4)
    saveFile(data, 'configuration.json')
}

async function exportData() {
    let data = JSON.stringify(await gatherData(), null, 4)
    saveFile(data, 'data.json')
}

async function gatherData() {
    let data = {}
    let sources = dsService.getDataSources()
    for(const i in sources) {
        const source = sources[i]
        data[source.alias] = await gatherFromDataSource(source.alias)
    }

    return data
}

async function gatherConfig() {
    return {
        version: 1,
        function: await gatherFromDataSource('function'),
        page: await gatherFromDataSource('page'),
        datasource: await gatherFromDataSource('datasource'),
        menu: await gatherFromDataSource('menu')
    }
}

async function gatherFromDataSource(alias: string) {
    let ds = dsService.getDataSourceByAlias(alias)
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
    router.push(`/configuration/menus/new`)
}

function editMenu(ctx) {
    router.push(`/configuration/menus/${ctx.id}`)
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