<template>
<div style="padding: 16px; height: 100%; width: 100%">
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

        <el-tabs v-model="activeTab" class="demo-tabs">

            <el-tab-pane :label="$t('script')" name="script">

                <el-form-item>
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
            </el-tab-pane>

            <el-tab-pane :label="$t('context')" name="context">

                <el-form-item>
                    <CodeEditor :field-config="getField('context')"
                                field="context"
                                format="json"
                                :runnable="false"
                                :model-value="getValue('context')"
                                @change="(val) => setValue('context', val)"
                    />
                </el-form-item>
            </el-tab-pane>


        </el-tabs>
    </el-form>

</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {onBeforeRouteLeave, useRoute, useRouter} from "vue-router";
import {computed, ComputedRef, onMounted, ref} from "vue";
import CodeEditor from "../../components/CodeEditor.vue";
import Input from "../../components/Input.vue";
import {generateEntityWithDefault} from "../../model/field";
import {DataSourceInterface} from "../../model/datasource";
import {useDataSourceService} from "../../services/datasource.service";
import {useSocketClient} from "../../services/socketio.service";
import {useSettings} from "../../services/settings.service";
import {useI18n} from 'vue-i18n'
import { FlakeId } from '../../flake-id'
import {useApiClient} from "../../services/api.service";
let flakeId = new FlakeId()

let router = useRouter();
let route = useRoute()
let functionEntity = ref(null)
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let isNew = ref(false)
let activeTab = 'script'
let isChanged = ref(false)


const socket = useSocketClient()
const settings = useSettings()
let api = useApiClient()

const { t } = useI18n();

let roomId = ""


onMounted(async () => {
    datasource = dsService.functionDataSource
    if (!datasource) {
        console.warn(`Function datasource doesn't exist`)
    }

    await load()
    document.title = `${t('function')} ${ isNew.value ? 'new' : ' ' + functionEntity.value.title } | ${window['env']['appTitle'] ? window['env']['appTitle'] : "Tabbled"}`
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

    if (roomId)
        socket.socket.off(roomId, consoleRoom)

    roomId = `console.${isNew.value ? flakeId.generateId().toString() : functionEntity.value.id}`
    socket.socket.on(roomId, consoleRoom)
    isChanged.value = false
}

function consoleRoom(data) {
    if (data.level === 'error') {
        console.error(...data.message)
    } else
        console.log(...data.message)
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

        isChanged.value = false

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

    isChanged.value = true
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

async function run() {
    try {
        let res = await api.post(`functions/script/run`, {
            script: functionEntity.value.script,
            context: context.value,
            room: roomId
        })

        console.log('%cFunction result:', 'color: green')
        console.log(res.data.data)
    } catch (e) {
        console.error(e)
    }
}

onBeforeRouteLeave(() => {
    if (isChanged.value) {
        const answer = window.confirm(t('leaveWithoutSavingWarn'))
        if (!answer) return false
    }
    return true
})

</script>

<style scoped>

</style>