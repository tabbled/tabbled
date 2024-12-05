<template>
    <div class="w-full h-full flex flex-col  items-center">
        <div class="flex w-full flex-row items-center border-b h-16" >
            <div class="flex flex-row p-4 items-center" style="width: 200px; height: 32px">
                <img style="height: 32px; width: 32px" src="/favicon.png" alt=""/>
                <div class="ml-4 text-xl text-slate-600">Tabbled</div>
            </div>
            <el-page-header @back="$router.back()" class="m-4 w-full">
                <template #content>
                    <div v-if="report && report.id"> {{$t('report.editTitle')}} - {{report.title}}</div>
                    <div v-else> {{$t('report.newTitle')}}</div>
                </template>

                <template #extra>
                    <div class="flex">
                        <el-button type="primary" size="small" :loading="renderingInProcess" @click="preview()">{{$t('report.preview')}}</el-button>
                        <el-button size="small" @click="save()">{{$t('save')}}</el-button>
                    </div>

                </template>
            </el-page-header>
        </div>

        <div class="w-full h-full  items-center" >
            <el-tabs v-if="report"
                     ref="tabsEl"
                     tab-position="left"
                     class="h-full w-full pl-8 tabs-config-content"
                     v-model="currentTab"
            >
                <el-tab-pane :label="$t('report.template')" name="template" class="p-8 h-full w-full absolute">
                    <RichText v-if="report.templateType === 'html'"
                              v-model="report.html"
                              :datasets="report.datasets"
                              class="h-full w-full"
                    />
                </el-tab-pane>
                <el-tab-pane :label="$t('report.datasets')" name="datasets" class="p-8 h-full w-full absolute">
                    <DatasetsEditor v-model="report.datasets" class="w-full h-full"/>
                </el-tab-pane>
                <el-tab-pane :label="$t('report.parameters')" name="parameters" class="p-8 w-full h-full absolute">
                    <ParamsEditor v-model="report.parameters" class="w-full h-full"/>
                </el-tab-pane>
                <el-tab-pane :label="$t('report.postprocessing')" name="postprocessing" class="p-8 w-full h-full absolute">
                    <PostprocessingEditor :report="report" class="w-full"/>
                </el-tab-pane>
                <el-tab-pane :label="$t('report.settings')" name="settings" class="p-8 h-full w-full absolute">
                    <ReportSettings :report="report" class="w-full h-full"/>
                </el-tab-pane>
            </el-tabs>
        </div>

    </div>
</template>

<script setup lang="ts">

import {ReportDto} from "./report.dto";
import {onMounted, ref} from "vue"
import {useI18n} from "vue-i18n";
import RichText from "./RichText.vue";
import {ElMessage} from "element-plus";
import {useApiClient} from "../../../services/api.service";
import ParamsEditor from "./ParamsEditor.vue";
import DatasetsEditor from "./DatasetsEditor.vue";
import {preview as previewReport} from "./utils";
import {useRoute, useRouter} from "vue-router";
import ReportSettings from "./ReportSettings.vue";
import PostprocessingEditor from "./PostprocessingEditor.vue";

let api = useApiClient()
const { t } = useI18n();
const currentTab = ref('template')
const route = useRoute()
const router = useRouter()
const renderingInProcess = ref(false)

onMounted(() => {
    load()
})

const load = async () => {

    if (route.params.id !== 'new') {
        let res = await api.get(`/v2/reports/${route.params.id}`)

        if (res.status !== 200) {
            ElMessage.error('Ooops, something went wrong!')
            return
        }

        report.value = res.data.report
    } else {
        report.value = {
            alias: "report",
            title: "New report",
            templateType: "html",
            datasets: [],
            parameters: [],
            postprocessing: "",
            pages: [],
            permissions: {
                view: {
                    type: "all",
                    roles: []
                }
            },
            pageSettings: {
                size: "A4",
                margin: "default",
                layout: "portrait"
            }
        }
    }
}

const report = ref<ReportDto>(null)

const preview = async () => {
    renderingInProcess.value = true

    let params = {}
    report.value.parameters.forEach(p => {
        params[p.alias] = p.defaultValue
    })

    try {
        await previewReport(report.value, params)
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    } finally {
        renderingInProcess.value = false
    }
}

const save = async() => {
    try {
        if (route.params.id === 'new') {
            let res = await api.post(`/v2/reports`, report.value)
            await router.replace({ params: { id: res.data.id }})
        } else {
            await api.post(`/v2/reports/${route.params.id}`, report.value)
        }
        ElMessage.success(t('saved'))
    } catch (e) {
        console.error(e)
        ElMessage.error(e.toString())
    }
}


</script>

<style lang="scss">

</style>