<template>
    <el-page-header style="padding: 16px;" @back="$router.back()">
        <template #content>
            <span> {{route.meta.title}} </span>
        </template>

    </el-page-header>

    <el-tabs tab-position="left" style="height: calc(100% - 64px)" v-model="activeTab" @tab-change="tabChange">

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
            DataSources coming soon
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

const route = useRoute()
const router = useRouter()
let activeTab = ref('')
const pagesDataSet = useDataSet({
    dataSource: 'page',
    alias: 'pages',
    autoOpen: true,
    autoCommit: false
})
const funcDataSet = useDataSet({
    dataSource: 'function',
    alias: 'functions',
    autoOpen: true,
    autoCommit: false
})

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



onMounted(async () => {
    await pagesDataSet.open()
    await funcDataSet.open()

    activeTab.value = route.query.activeTab ? <string>route.query.activeTab : 'pages'
    await router.replace({path: '/configuration', query: {activeTab: activeTab.value}})

});

function tabChange(d) {
    router.replace({path: '/configuration', query: {activeTab: d}})
}

function addPage() {
    router.push(`/designer/new`)
}

function editPage(ctx) {
    router.push(`/designer/${ctx.id}`)
}

function addFunc() {
    router.push(`/functions/new`)
}

function editFunc(ctx) {
    router.push(`/functions/${ctx.id}`)
}


</script>

<style scoped>

</style>