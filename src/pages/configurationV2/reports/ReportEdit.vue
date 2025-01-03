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
                              :params="report.parameters"
                              :context-parameters="getContextParameters"
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

import {ContextParameter, ReportDto} from "./report.dto";
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
import _ from "lodash"

let api = useApiClient()
const { t } = useI18n();
const currentTab = ref('template')
const route = useRoute()
const router = useRouter()
const renderingInProcess = ref(false)
const report = ref<ReportDto>(null)
let postprocessingScript = ""
let context = {}

onMounted(() => {
    load()
})

//watchDeep(report, useDebounceFn(() => gatherContext(), 2000))

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
            title: "New report",
            templateType: "html",
            datasets: [],
            parameters: [],
            postprocessing: `// The script must return an object with some transformed data.
// The script can return an async function.
// This data can be used in template

//Function that transform the data from context
async function prepare() {
    let items = []
    for (let i in ctx.dataset1.items) {
        // Do something with data
    }

    return {
        items
    }
}

// Return the function or prepared data
return prepare()`,
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

const getContextParameters = async (path?: string) : Promise<ContextParameter[]> => {
    console.log('gatherContext', path)

    // Get report context to know the parameter that return the postprocessing script
    // and another variables available on context
    if (postprocessingScript !== report.value.postprocessing) {
        let params = {}
        report.value.parameters.forEach(param => {
            switch (param.type) {
                case "number": params[param.alias] = Number(param.defaultValue); break;
                default: params[param.alias] = param.defaultValue
            }
        })
        let res = await api.post('v2/reports/postprocess', {report: report.value, params: params})
        if (res.status !== 200) {
            console.error(res)
        } else {
            context = res.data.data
            postprocessingScript = report.value.postprocessing
            console.log(res.data.data)
        }
    }

    let params:ContextParameter[] = []

    if (path && Array.isArray(_.get(context, path))) {
        const arr = _.get(context, path)
        if (arr.length) {
            let keys = Object.keys(arr[0])
            for(let i in keys) {
                parsePath(arr[0][keys[i]], keys[i], 'item.' + keys[i], keys[i])
            }
        }
    }


    for (let i in report.value.parameters) {
        let param = report.value.parameters[i]
        params.push({
            id: `params.${param.alias}`,
            label: `Parameters → ${param.title}`,
            dataType: param.isMultiple ? 'array' : paramTypeTo(param.type),
            description: param.description,
            path: `params.${param.alias}`
        })
    }

    for (let i in report.value.datasets) {
        let ds = report.value.datasets[i]


        params.push({
            id: `${ds.alias}`,
            label: `${ds.alias}`,
            dataType: 'object',
            description: '',
            path: `${ds.alias}`
        })

        params.push({
            id: `${ds.alias}.items`,
            label: `${ds.alias} → Items`,
            dataType: 'array',
            description: '',
            path: `${ds.alias}.items[]`
        })

        params.push({
            id: `${ds.alias}.totalCount`,
            label: `${ds.alias} → totalCount`,
            dataType: 'number',
            description: '',
            path: `${ds.alias}.totalCount`,
        })

        if (ds.groupBy && ds.groupBy.length && ds.fields.filter(f=> f.aggFunc !== 'none').length) {
            params.push({
                id: `${ds.alias}.totals`,
                label: `${ds.alias} → Totals`,
                dataType: 'object',
                description: '',
                path: `${ds.alias}.totals`
            })

            ds.fields.filter(f=> f.aggFunc !== 'none').forEach(f => {
                params.push({
                    id: `${ds.alias}.totals.${f.alias}`,
                    label: `${ds.alias} → Totals → ${f.alias}`,
                    dataType: 'number',
                    description: '',
                    path: `${ds.alias}.totals.${f.alias}`
                })
            })
        }
    }

    let keys = Object.keys(context)
    for(let i in keys) {
        if (['account', 'accountId', 'user', 'userId', 'params', ...report.value.datasets.map(m => m.alias)].includes(keys[i]))
            continue
        parsePath(context[keys[i]], keys[i], keys[i], keys[i])
    }

    function parsePath(object, p, key, label) {
        if (typeof object === 'object' && Array.isArray(object)) {
            console.log(object, p, typeof object)
            params.push({
                id: key,
                path: p + '[]',
                description: "",
                dataType: "array",
                label: label
            })
        } else if (typeof object === 'object') {
            let keys = Object.keys(object)
            for(let i in keys) {
                const key = keys[i]
                parsePath(object[key], `${p ? p + '.' + key : ''}`, `${p ? p + '.' + key : ''}`, `${label ? label + ' → ' + key : ''}`)
            }
        } else {
            params.push({
                id: key,
                path: p,
                description: "",
                dataType: paramTypeFromTypeof(typeof object),
                label: label
            })
        }
    }

    return params
}

const paramTypeFromTypeof = (type) => {
    switch (type) {
        case 'bool':
        case 'number':
        case 'string':
        case 'array':
        case 'object': return type
        default: { console.log(type); return "object" }
    }
}

const paramTypeTo = (type) => {
    switch (type) {
        case 'date':
        case 'time':
        case 'datetime':
        case 'bool':
        case 'number':
        case 'string': return type
        case 'select':
        case 'enum':
        default: return "string"
    }
}


</script>

<style lang="scss">

</style>