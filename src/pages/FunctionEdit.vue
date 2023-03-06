<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{route.meta.title}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button @click="cancel">Cancel</el-button>
                <el-button @click="save" type="primary">Save</el-button>
            </div>
        </template>
    </el-page-header>

    <CodeEditor context="" :data-set="dataSet" field="context"/>
    <CodeEditor context="" :data-set="dataSet" field="script"/>
</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {useDataSet} from "../model/dataset";
import {useRoute, useRouter} from "vue-router";
import {onMounted} from "vue";
import CodeEditor from "../components/CodeEditor.vue";

let router = useRouter();
let route = useRoute()

let dataSet = useDataSet({
    dataSource: 'function',
    alias: 'functions',
    autoOpen: false,
    autoCommit: false
})

onMounted(async () => {
    await dataSet.openOne(!route.params.id || route.params.id === 'new' ? undefined : <string>route.params.id)
    //await router.replace({name: 'functionEdit', params: { id: dataSet.currentId }})
});

async function save() {
    try {
        await dataSet.commit()
        ElMessage.success('Saved successfully')
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function cancel() {
    if (dataSet.isChanged()) {
        console.log("changed")
        dataSet.rollback()
    }

    router.back()
}

</script>

<style scoped>

</style>