<template>
    <el-page-header style="padding: 16px;" @back="$router.back()">
        <template #content>
            <span> {{route.meta.title}} </span>
        </template>
        <template #extra>
            <el-button text @click="loadConfigFile">
                <template #icon>
                    <Icon width="26" icon="mdi:import"></Icon>
                </template>
                Import
            </el-button>

            <el-button text @click="exportConfig">
                <template #icon>
                    <Icon width="26" icon="mdi:export"></Icon>
                </template>
                Export
            </el-button>
        </template>
    </el-page-header>

    <el-tabs tab-position="left" style="height: calc(100% - 64px)" v-model="activeTab" @tab-change="tabChange">

        <el-tab-pane label="Menus"  style="padding: 16px" name="menus">
            <DataSetActionPanel context=""
                                :data-set="menusDataSet"
                                style="padding-bottom: 16px"
                                is-pure
                                @add="addMenu"
                                @edit="editMenu"
            />
            <Table :columns="menuColumns"
                   id="menu"
                   context=""
                   :data-set="menusDataSet"
                   :is-inline-editing="false"
                   @row-dbl-click="editMenu"
                   :readonly="true"
            />
        </el-tab-pane>

        <el-tab-pane label="Pages"  style="padding: 16px" name="pages">
            <DataSetActionPanel context=""
                                :data-set="pagesDataSet"
                                style="padding-bottom: 16px"
                                is-pure
                                @add="addPage"
                                @edit="editPage"
            />
            <Table :columns="pagesColumns"
                   id="pages"
                   context=""
                   :data-set="pagesDataSet"
                   :is-inline-editing="false"
                   @row-dbl-click="editPage"
                   :readonly="true"
            />
        </el-tab-pane>

        <el-tab-pane label="Data sources" style="padding: 16px" name="datasources">
            <DataSetActionPanel context=""
                                :data-set="dsDataSet"
                                style="padding-bottom: 16px"
                                is-pure
                                @add="addDataSource"
                                @edit="editDataSource"
            />
            <Table :columns="dsColumns"
                   id="ds"
                   context=""
                   :data-set="dsDataSet"
                   :is-inline-editing="false"
                   :readonly="true"
                   @row-dbl-click="editDataSource"
            />
        </el-tab-pane>

        <el-tab-pane label="Functions" style="padding: 16px" name="functions">
            <DataSetActionPanel context=""
                                :data-set="funcDataSet"
                                style="padding-bottom: 16px"
                                is-pure
                                @add="addFunc"
                                @edit="editFunc"
            />
            <Table :columns="funcColumns"
                   id="func"
                   context=""
                   :data-set="funcDataSet"
                   :is-inline-editing="false"
                   @row-dbl-click="editFunc"
                   :readonly="true"
            />
        </el-tab-pane>

        <el-tab-pane label="Report templates" style="padding: 16px" name="reports">
            Report templates coming soon
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Table from "../components/Table.vue";
import {ColumnConfigInterface} from "../model/column";
import {useDataSet} from "../model/dataset";
import {onMounted, ref} from "vue";
import DataSetActionPanel from "../components/DataSetActionPanel.vue";
import {ScreenSize} from "../model/page";
import {useDataSourceService} from "../services/datasource.service";

const props = defineProps<{
    screenSize: ScreenSize
}>()

const route = useRoute()
const router = useRouter()
const dsService = useDataSourceService()
let activeTab = ref('')
const pagesDataSet = ref(useDataSet({
    dataSource: 'page',
    alias: 'pages',
    autoOpen: true,
    autoCommit: false
}))
const funcDataSet = ref(useDataSet({
    dataSource: 'function',
    alias: 'functions',
    autoOpen: true,
    autoCommit: false
}))
const dsDataSet = ref(useDataSet({
    dataSource: 'datasource',
    alias: 'datasources',
    autoOpen: true,
    autoCommit: false
}))
const menusDataSet = ref(useDataSet({
    dataSource: 'menu',
    alias: 'menus',
    autoOpen: true,
    autoCommit: false
}))


const pagesColumns:ColumnConfigInterface[] = [
    {
        "id": "1",
        "field": "alias",
        "title": "Page alias",
        "width": 150,
        "sortable": true
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
    await pagesDataSet.value.open()
    await funcDataSet.value.open()
    await dsDataSet.value.open()
    await menusDataSet.value.open()

    activeTab.value = route.query.activeTab ? <string>route.query.activeTab : 'pages'
    await router.replace({path: '/configuration', query: {activeTab: activeTab.value}})

    setAppTitle()
});


function loadConfigFile() {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = _ => {
        let files =   Array.from(input.files);
        const fr = new FileReader();
        fr.readAsText(files[0]);
        fr.addEventListener('load', (e) => {
            importConfig(JSON.parse(e.target.result.toString()))
        })
    };
    input.click();
}

async function importConfig(config: any) {
    //console.log(config)
    console.log('Start load configuration with version ' + config.version)

    await updateConfigOnDataSource('menu', config.menu)
    await updateConfigOnDataSource('function', config.function)
    await updateConfigOnDataSource('page', config.page)
    await updateConfigOnDataSource('datasource', config.datasource)

    console.log("Loading configuration have been finished. Reload the page")
}

async function exportConfig() {

    let data = JSON.stringify(await gatherConfig(), null, 4)
    let file = new Blob([data]);
    let a = document.createElement("a"),
        url = URL.createObjectURL(file)

    a.href = url;
    a.download = 'configuration.json';
    document.body.appendChild(a);
    a.click();

    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
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

    return await ds.getManyRaw([], 1000)
}

async function updateConfigOnDataSource(alias: string, data: any[]) {

    let ds = dsService.getDataSourceByAlias(alias)
    if (!ds)
        return;

    for(let i in data) {
        const item = data[i]
        await ds.updateById(item.id, item.data)
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
    router.push(`/configuration/menus/new`)
}

function editMenu(ctx) {
    router.push(`/configuration/menus/${ctx.id}`)
}


</script>

<style scoped>

</style>