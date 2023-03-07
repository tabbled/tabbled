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

    <el-form label-position="top">
        <div style="display: flex; flex-direction: row; width: 100%">
            <el-form-item label="Title" style="width: 50%; padding-right: 8px">
                <Input :data-set="dataSet" field="title" />
            </el-form-item>

            <el-form-item label="Alias" style="width: 50%">
                <Input :data-set="dataSet" field="alias" />
            </el-form-item>
        </div>

        <el-form-item label="Context">
            <CodeEditor :data-set="dataSet"
                        field="context"
                        format="json"
                        :runnable="false"
            />
        </el-form-item>

        <el-form-item label="Script">
            <CodeEditor :context="context()"
                        :data-set="dataSet"
                        field="script"
                        format="javascript"
                        runnable
            />
        </el-form-item>
    </el-form>

</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {useDataSet} from "../model/dataset";
import {useRoute, useRouter} from "vue-router";
import {onMounted} from "vue";
import CodeEditor from "../components/CodeEditor.vue";
import Input from "../components/Input.vue";

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

function context() {
    try {
        return JSON.parse(dataSet.current.context)
    }
    catch (e) {
        console.error(e)
        return {}
    }

}

</script>

<style scoped>

</style>