<template>
    <div v-if="!modelValue" slot="noContent" class="p-4 items-center flex flex-col">
        Parameter is not set
    </div>
    <div v-else class="flex flex-col">

        <div  class="flex flex-col w-full h-full">
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
                <div v-if="modelValue.type === 'link' || modelValue.type === 'enum'" class="flex flex-row items-center gap-4">
                    <label for="multipleInput" class="w-44">{{$t('report.parameter.isMultiple')}}</label>
                    <el-switch class="w-full" v-model="modelValue.isMultiple" />
                </div>

                <div class="flex flex-row items-center gap-4">
                    <label for="defaultInput" class="w-44">{{$t('report.parameter.default')}}</label>
                    <el-input id="defaultInput" v-model="modelValue.defaultValue"/>
                </div>

                <div v-if="modelValue.type === 'link'" class="flex flex-row items-center gap-4">
                    <label for="datasourceInput" class="w-44">{{$t('report.parameter.datasourceRef')}}</label>
                    <el-select id="datasourceInput"
                               v-model="modelValue.datasourceReference" clearable>
                        <el-option
                            v-for="item in datasourceList"
                            :key="item.key"
                            :label="item.label"
                            :value="item.key"
                        />
                    </el-select>
                </div>
                <div v-if="modelValue.type === 'link'" class="flex flex-row items-center gap-4">
                    <label for="datasourceDisplayFieldInput" class="w-44">{{$t('report.parameter.datasourceRefDisplayField')}}</label>
                    <el-select id="datasourceDisplayFieldInput"
                               v-model="modelValue.datasourceRefDisplayField"
                               :disabled="!modelValue.datasourceReference"
                               clearable
                    >
                        <el-option
                            v-for="item in fieldsList"
                            :key="item.key"
                            :label="item.label"
                            :value="item.key"
                        />
                    </el-select>
                </div>
            </div>
        </div>
        <div class="p-4">
            <el-button size="small" @click="emit('remove')">{{$t('delete')}}</el-button>
        </div>
    </div>

</template>

<script setup lang="ts">

import {ReportParameterDto} from "./report.dto";
import {onMounted, ref, watch} from "vue"
import { useRouter } from "vue-router";
import {useApiClient} from "../../../services/api.service";
import EditableLabel from "../../../components/editable-label/EditableLabel.vue";

const router = useRouter()
const api = useApiClient()
const typeList = [
    {key: "number",label: "Number"},
    {key: "string",label: "String"},
    {key: "bool",label: "Bool"},
    {key: "link",label: "Link"},
    {key: "datetime",label: "Datetime"},
    {key: "date",label: "Date"},
    //{key: "time",label: "Time"},
    //{key: "enum",label: "Enum"},
]
const datasourceList = ref([])
const fieldsList = ref([])

interface Props {
    modelValue?: ReportParameterDto
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => null
})

const emit = defineEmits(['update:modelValue', 'remove'])

onMounted(() => {
    console.log(props.modelValue)
    loadDatasource()
    loadFields()
})

watch(() => props.modelValue.type, () => {
    if (props.modelValue?.type === 'link') {
        loadDatasource()
        loadFields()
    }
})

watch(() => props.modelValue.datasourceReference, () => {
    if (props.modelValue.type === 'link') {
        loadFields()
    }
})

const loadDatasource = async () => {
    try {
        let res = await api.get('v2/datasource')
        if (res.status !== 200) {
            console.error(res)
            return
        }

        res.data.items.forEach(item => {
            if (item.type === 'internal' || item.type === 'internal-db')
                datasourceList.value.push({
                    key: item.alias,
                    label: `${item.title} (${item.alias})`
                })
        })
    }catch (e) {
        console.error(e)
    }
}

const loadFields = async () => {
    fieldsList.value = []
    if (!props.modelValue.datasourceReference)
        return

    try {
        let res = await api.get(`v2/datasource/${props.modelValue.datasourceReference}/fields?nested=true`)
        if (res.status !== 200) {
            console.error(res)
            return
        }

        res.data.items.forEach(item => {
            fieldsList.value.push({
                key: item.alias,
                label: `${item.title} (${item.alias})`,
                isTree: item.isTree
            })
        })
    }catch (e) {
        console.error(e)
    }
}

const render = () => {

}

</script>

<style scoped>

</style>