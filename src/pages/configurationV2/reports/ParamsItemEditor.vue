<template>
    <div v-if="!modelValue" slot="noContent">
        Parameter is not set
    </div>
    <div v-else class="flex flex-col">
        <div class="w-full ">
            <EditableLabel class="p-4 pl-6 pr-6 font-medium border-b" v-model="modelValue.title"/>
        </div>

        <div class="flex flex-col p-6 gap-4 h-full">
            <div class="flex flex-row items-center gap-4">
                <label for="aliasInput" class="w-44">{{$t('report.parameter.alias')}}</label>
                <el-input id="aliasInput" v-model="modelValue.alias"/>
            </div>
            <div class="flex flex-row items-center gap-4">
                <label for="descInput" class="w-44">{{$t('report.parameter.description')}}</label>
                <el-input id="descInput" v-model="modelValue.description"/>
            </div>
            <div class="flex flex-row items-center gap-4">
                <label for="typeInput" class="w-44">{{$t('report.parameter.type')}}</label>
                <el-select id="typeInput" v-model="modelValue.type">
                    <el-option
                        v-for="item in typeList"
                        :key="item.key"
                        :label="item.label"
                        :value="item.key"
                    />
                </el-select>
            </div>
            <div v-if="modelValue.type === 'link'" class="flex flex-row items-center gap-4">
                <label for="multipleInput" class="w-44">{{$t('report.parameter.isMultiple')}}</label>
                <el-switch class="w-full" v-model="modelValue.isMultiple" />
            </div>

            <div class="flex flex-row items-center gap-4">
                <label for="defaultInput" class="w-44">{{$t('report.parameter.default')}}</label>
                <el-input id="defaultInput" v-model="modelValue.defaultValue"/>
            </div>

        </div>
    </div>

</template>

<script setup lang="ts">

import {ReportDto, ReportParameterDto} from "./report.dto";
import { useRouter } from "vue-router";
import EditableLabel from "../../../components/editable-label/EditableLabel.vue";

const router = useRouter()
const typeList = [
    {key: "number",label: "Number"},
    {key: "string",label: "String"},
    {key: "bool",label: "Bool"},
    {key: "link",label: "Link"},
    {key: "datetime",label: "Datetime"},
    {key: "date",label: "Date"},
    {key: "time",label: "Time"},
    {key: "enum",label: "Enum"},
]

interface Props {
    modelValue: ReportParameterDto
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => null
})

const emit = defineEmits(['update:modelValue'])

const render = () => {

}

</script>

<style scoped>

</style>