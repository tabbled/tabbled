<template>
    <el-page-header style="padding: 16px;" @back="$router.back()">
        <template #content>
            <span> {{route.meta.title}} </span>
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
                   context=""
                   :data-set="menusDataSet"
                   :is-inline-editing="false"
                   @row-dbl-click="editMenu"
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
                   context=""
                   :data-set="pagesDataSet"
                   :is-inline-editing="false"
                   @row-dbl-click="editPage"
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
                   context=""
                   :data-set="dsDataSet"
                   :is-inline-editing="false"
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
                   context=""
                   :data-set="funcDataSet"
                   :is-inline-editing="false"
                   @row-dbl-click="editFunc"
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

const props = defineProps<{
    screenSize: ScreenSize
}>()

const route = useRoute()
const router = useRouter()
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
        "field": "alias",
        "title": "Page alias",
        "width": 150,
        "sortable": true
    },
    {
        "field": "title",
        "title": "Title",
        "width": 350,
        "sortable": true
    }
]

const funcColumns:ColumnConfigInterface[] = [
    {
        "field": "alias",
        "title": "alias",
        "width": 150,
        "sortable": true
    },
    {
        "field": "title",
        "title": "Title",
        "width": 200,
        "sortable": true
    }
]
const dsColumns:ColumnConfigInterface[] = [
    {
        "field": "alias",
        "title": "alias",
        "width": 150,
        "sortable": true
    },
    {
        "field": "title",
        "title": "Title",
        "width": 200,
        "sortable": true
    },
    {
        "field": "Source",
        "title": "source",
        "width": 200,
        "sortable": true
    }
]
const menuColumns:ColumnConfigInterface[] = [
    {
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