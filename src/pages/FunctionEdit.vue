<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{$t('function')}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button @click="cancel">{{$t('cancel')}}</el-button>
                <el-button @click="save" type="primary">{{$t('save')}}</el-button>
            </div>
        </template>
    </el-page-header>

    <el-form label-position="top">
        <div style="display: flex; flex-direction: row; width: 100%">
            <el-form-item :label="$t('title')" style="width: 50%; padding-right: 8px">
                <Input :field-config="getField('title')"
                       field="title"
                       :model-value="getValue('title')"
                       @change="(val) => setValue('title', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('alias')" style="width: 50%">
                <Input :field-config="getField('alias')"
                       field="alias"
                       :model-value="getValue('alias')"
                       @change="(val) => setValue('alias', val)"
                />
            </el-form-item>
        </div>

        <el-form-item :label="$t('context')">
            <CodeEditor :field-config="getField('context')"
                        field="context"
                        format="json"
                        :runnable="false"
                        :model-value="getValue('context')"
                        @change="(val) => setValue('context', val)"
            />
        </el-form-item>

        <el-form-item :label="$t('script')">
            <el-button text type="primary" style="margin-bottom: 8px"  @click="run();">
                <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                {{$t('run')}}
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
import {useSettings} from "../services/settings.service";
import {useI18n} from 'vue-i18n'

let router = useRouter();
let route = useRoute()
let functionEntity = ref(null)
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let isNew = ref(false)
let updateKey = ref(0)

const socket = useSocketClient()
const settings = useSettings()

const { t } = useI18n();


onMounted(async () => {
    datasource = dsService.functionDataSource
    if (!datasource) {
        console.warn(`Function datasource doesn't exist`)
    }

    await load()
    document.title = `${t('function')} ${ isNew.value ? 'new' : ' ' + functionEntity.title } | ${window['env']['appTitle']}`
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
            let item = await datasource.insert(functionEntity.value.id, functionEntity.value)
            await router.replace({params: {id: item.id}})
            await load()
        } else {
            await datasource.updateById(functionEntity.value.id, functionEntity.value)
        }

        ElMessage.success(t('saved'))
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