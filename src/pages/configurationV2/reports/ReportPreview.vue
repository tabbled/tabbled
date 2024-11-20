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
                <el-button type="primary" text size="small" @click="edit">{{$t('edit')}}</el-button>
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

        <div class="flex flex-row w-full p-4 border-t">
            <div class="w-full" />
            <el-button type="primary" size="small" @click="render()">{{$t('render')}}</el-button>
        </div>

    </div>

</template>

<script setup lang="ts">

import {ReportDto} from "./report.dto";
import {onMounted, ref, watch} from "vue"
import { useRouter } from "vue-router";
import ParamInput from "./ParamInput.vue";
import {ElMessage} from "element-plus";
import {preview} from "./utils";

const router = useRouter()
const paramValues = ref({})

interface Props {
    report: ReportDto
}

const props = withDefaults(defineProps<Props>(), {
    report: () => null
})

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
        paramValues.value[param.alias] = param.defaultValue
    })

    console.log(paramValues.value)
}

const emit = defineEmits([])


const edit = () => {
    router.push(`/v2/configuration/reports/${props.report.alias}`)
}

const render = async () => {
    console.log('Preview Report')

    console.log(paramValues.value)
    try {
        await preview(props.report, paramValues.value)
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

</script>

<style scoped>

</style>