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
                    <label for="aliasInput" class="w-44 flex-none">{{$t('report.parameter.alias')}}</label>
                    <el-input id="aliasInput" v-model="modelValue.alias"/>
                </div>
                <div class="flex flex-row items-center gap-4">
                    <label for="descInput" class="w-44 flex-none">{{$t('report.parameter.description')}}</label>
                    <el-input id="descInput" v-model="modelValue.description"/>
                </div>
                <div class="flex flex-row items-center gap-4">
                    <label for="typeInput" class="w-44 flex-none">{{$t('report.parameter.type')}}</label>
                    <el-select id="typeInput" v-model="modelValue.type">
                        <el-option
                            v-for="item in typeList"
                            :key="item.key"
                            :label="item.label"
                            :value="item.key"
                        />
                    </el-select>
                </div>
                <div v-if="modelValue.type === 'select' || modelValue.type === 'enum'" class="flex flex-row items-center gap-4">
                    <label for="multipleInput" class="w-44 flex-none">{{$t('report.parameter.isMultiple')}}</label>
                    <el-switch class="w-full" v-model="modelValue.isMultiple" />
                </div>

                <div class="flex flex-row items-center gap-4">
                    <label for="defaultInput" class="w-44 flex-none">{{$t('report.parameter.default')}}</label>
                    <el-input v-if="modelValue.type === 'string'" id="defaultInput" v-model="modelValue.defaultValue"/>
                    <el-input-number class="w-full" :controls="false"  v-if="modelValue.type === 'number'" id="defaultInput" v-model="modelValue.defaultValue"/>
                    <el-select v-if="modelValue.type === 'bool'" id="defaultInput"  v-model="modelValue.defaultValue" >
                        <el-option label="Null" :value="null"/>
                        <el-option label="True" :value="true"/>
                        <el-option label="False" :value="false"/>
                    </el-select>
                    <el-select v-if="modelValue.type === 'select'" id="defaultInput"  v-model="modelValue.defaultValue" >
                    </el-select>
                    <el-date-picker v-if="modelValue.type === 'datetime'"
                                    type="datetime"
                                    @update:model-value="e => onChangeDefault(e)"
                                    :model-value="getDefaultDate()"
                                    format="DD.MM.YYYY hh:mm:ss"
                                    style="width: 100%"
                    />
                    <el-date-picker v-else-if="modelValue.type === 'date'"
                                    type="date"
                                    @update:model-value="e => onChangeDefault(e)"
                                    :model-value="getDefaultDate('YYYYMMDD')"
                                    format="DD.MM.YYYY"
                                    style="width: 100%"
                                    />
                </div>

                <div v-if="modelValue.type === 'select'" class="flex flex-row items-center gap-4">
                    <label for="datasourceInput" class="w-44 flex-none">{{$t('report.parameter.datasourceRef')}}</label>
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
                <div v-if="modelValue.type === 'select'" class="flex flex-row items-center gap-4">
                    <label for="datasourceDisplayFieldInput" class="w-44 flex-none">{{$t('report.parameter.datasourceRefDisplayField')}}</label>
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
import dayjs from "dayjs";

const router = useRouter()
const api = useApiClient()
const typeList = [
    {key: "number",label: "Number"},
    {key: "string",label: "String"},
    {key: "bool",label: "Bool"},
    {key: "select",label: "Select"},
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
    if (props.modelValue?.type === 'select') {
        loadDatasource()
        loadFields()
    }
    props.modelValue.defaultValue = null
})

watch(() => props.modelValue.datasourceReference, () => {
    if (props.modelValue.type === 'select') {
        loadFields()
    }
})


const getDefaultDate = (format?) => {
    if (!props.modelValue.defaultValue)
        return null

    return dayjs(props.modelValue.defaultValue, format).valueOf()
}

const onChangeDefault = (value: any) => {
    if (value === null || value === undefined) {
        props.modelValue.defaultValue = null
        return
    }

    if (props.modelValue.type === 'date') {
        props.modelValue.defaultValue = dayjs(value).format('YYYYMMDD')
        return
    }

    if (props.modelValue.type === 'datetime') {
        props.modelValue.defaultValue = dayjs(value).toISOString()
        return
    }
}

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