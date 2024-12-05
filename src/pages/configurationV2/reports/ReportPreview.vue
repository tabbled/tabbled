<template>
    <div v-if="!report" slot="noContent" class="w-full text-center p-6">
        {{$t('report.message.selectReport')}}
    </div>
    <div v-else class="flex flex-col w-full">
        <div class="flex flex-row items-center p-6">
            <div class="w-full">
                <div class="text-xl ">{{report.title}}</div>
                <div class="text-sm text-slate-400">{{report.description}}</div>
            </div>

            <div class="flex flex-row pl-6">
                <el-button v-if="canEdit" type="primary" text size="small" @click="edit">{{$t('edit')}}</el-button>
            </div>
        </div>
        <el-divider class="m-0"/>

        <div class="flex flex-col p-6 gap-4 h-full">
            <div class="flex flex-row items-center" v-for="item in report.parameters">

                <label :for="`param-${item.alias}`" class="w-52 text-left pr-4">{{item.title}}</label>
                <div  class="w-full">
                    <ParamInput :id="`param-${item.alias}`" :parameter="item" v-model="paramValues[item.alias]"/>
                </div>
            </div>
        </div>

        <div class="flex flex-row w-full p-4 gap-2 border-t">
            <div class="w-full " />
             <el-select size="small" class="w-44" v-model="output">
                 <el-option value="pdf" label="Pdf"/>
                 <el-option value="xlsx" label="Excel"/>
             </el-select>
            <el-button type="primary" :loading="rendering" size="small" @click="render()">{{$t('render')}}</el-button>
        </div>

    </div>

</template>

<script setup lang="ts">

import {ReportDto} from "./report.dto";
import {onMounted, ref, watch} from "vue"
import { useRouter } from "vue-router";
import ParamInput from "./ParamInput.vue";
import {ElMessage} from "element-plus";
import {render as renderReport} from "./utils";


const router = useRouter()
const paramValues = ref({})
const output = ref('pdf')
interface Props {
    report: ReportDto,
    canEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
    report: () => null,
    canEdit: false
})

const rendering = ref(false)

onMounted(() => {
    populateParamValues()
})

watch(() => props.report, () => {
    populateParamValues()
})

const populateParamValues = () => {
    paramValues.value = {}
    if (!props.report) {
        return
    }
    props.report.parameters.forEach(param => {
        switch (param.type) {
            case "number": paramValues.value[param.alias] = Number(param.defaultValue); break;
            default: paramValues.value[param.alias] = param.defaultValue
        }

    })
}

const emit = defineEmits([])


const edit = () => {
    router.push(`/v2/configuration/reports/${props.report.id}`)
}

const render = async () => {
    if (rendering.value)
        return

    rendering.value = true
    try {
        await renderReport(props.report.id, paramValues.value, output.value, {})
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    } finally {
        rendering.value = false
    }
}

</script>

<style scoped>

</style>