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
                <Input :field-config="getField('title')"
                       field="title"
                       :model-value="getValue('title')"
                       @change="(val) => setValue('title', val)"
                />
            </el-form-item>

            <el-form-item label="Alias" style="width: 50%">
                <Input :field-config="getField('alias')"
                       field="alias"
                       :model-value="getValue('alias')"
                       @change="(val) => setValue('alias', val)"
                />
            </el-form-item>
        </div>

        <el-form-item label="Context">
            <CodeEditor :field-config="getField('context')"
                        field="context"
                        format="json"
                        :runnable="false"
                        :model-value="getValue('context')"
                        @change="(val) => setValue('context', val)"
            />
        </el-form-item>

        <el-form-item label="Script">
            <el-button text type="primary" style="margin-bottom: 8px"  @click="run();">
                <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                Run
            </el-button>
            <CodeEditor :context="context"
                        :field-config="getField('script')"
                        field="script"
                        format="javascript"
                        :model-value="getValue('script')"
                        @change="(val) => setValue('script', val)"
            />
        </el-form-item>
    </el-form>

</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {computed, ComputedRef, onMounted, ref} from "vue";
import CodeEditor from "../components/CodeEditor.vue";
import Input from "../components/Input.vue";
import {generateEntityWithDefault} from "../model/field";
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
import {useSocketClient} from "../services/socketio.service";

let router = useRouter();
let route = useRoute()
let functionEntity = ref(null)
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let isNew = ref(false)
let updateKey = ref(0)

const socket = useSocketClient()


onMounted(async () => {
    datasource = dsService.getDataSourceByAlias('function')
    if (!datasource) {
        console.warn(`Function datasource doesn't exist`)
    }

    await load()
    //@ts-ignore
    document.title = `Function ${ isNew.value ? 'new' : ' ' + functionEntity.title } | ${import.meta.env.VITE_APP_TITLE}`
});

function getField(alias) {
    if (!datasource)
        return undefined;
    return datasource.getFieldByAlias(alias)
}

async function load() {
    if (!datasource)
        return;

    if (!route.params.id || route.params.id === 'new') {
        functionEntity.value = await generateEntityWithDefault(datasource.fields)
        isNew.value = true
    } else {
        functionEntity.value = await datasource.getById(<string>route.params.id)
        isNew.value = false
    }
    updateKey.value++
}

async function save() {
    try {
        if (isNew.value) {
            await datasource.insert(functionEntity.value.id, functionEntity.value)
        } else {
            await datasource.updateById(functionEntity.value.id, functionEntity.value)
        }

        ElMessage.success('Saved successfully')
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

function getValue(alias) {
    if (!functionEntity.value)
        return undefined;

    return functionEntity.value[alias]
}

function setValue(alias, val) {
    if (!functionEntity.value)
        return undefined;

    functionEntity.value[alias] = val
}

async function cancel() {
    router.back()
}

const context: ComputedRef<any> = computed((): any =>  {
    if (!functionEntity.value || !functionEntity.value.context)
        return {}

    try {
        return JSON.parse(functionEntity.value.context)
    }
    catch (e) {
        console.error(e)
        return {}
    }
})

function run() {
    socket.emit('functions/call', {
        alias: functionEntity.value.alias,
        context: context.value
    })
}


</script>

<style scoped>

</style>