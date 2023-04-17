<template>
    <el-select v-if="!fieldConfig"
               :disabled="isDisabled"
    />
    <el-select v-if="fieldConfig && fieldConfig.type === 'link'"
               filterable
               :model-value="value"
               :disabled="isDisabled"
               remote
               clearable
               remote-show-suffix
               :remote-method="getData"
               :loading="isLoading"
               @change="(val) => change(val)"
               style="width: 100%"
    >
        <el-option
            v-for="item in data"
            :key="item[keyProp]"
            :label="item[displayProp]"
            :value="item[keyProp]"
        />
    </el-select>
    <el-select v-else-if="fieldConfig && fieldConfig.type === 'enum'"
               filterable
               :model-value="value"
               :disabled="isDisabled"
               clearable
               @change="(val) => change(val)"
               style="width: 100%"
    >
        <el-option
            v-for="item in fieldConfig.values"
            :key="item.key"
            :label="item.title"
            :value="item.key"
        />
    </el-select>
</template>

<script setup lang="ts">
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref, watch} from "vue";
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";

let isLoading = ref(false)
let data = ref<Array<object>>([])
let source: DataSourceInterface = null
let value = ref(null)
let isDisabled = ref(true)
let dsService = useDataSourceService()
let dataSource:DataSourceInterface = null

interface Props {
    field: string,
    fieldConfig: FieldConfigInterface,
    modelValue?: any
    keyProp?: string,
    displayProp?: string,
    update?:number,
    //load?: Promise<any>
}


const props = withDefaults(defineProps<Props>(), {
    keyProp: "id",
    displayProp: "name"
})

const emit = defineEmits(['update:modelValue', 'change'])

onMounted(() => {
    init()
})

watch(() => props.modelValue,
    async () => {
        init()
        await getValue()
    })

watch(() => props.update,
    async () => {
        await getValue()
    })

function init() {
    isDisabled.value = true

    if (!props.fieldConfig) {
        return
    }


    if (props.fieldConfig.type == 'link') {
        dataSource = dsService.getDataSourceByAlias(props.fieldConfig.datasource)

        if (!dataSource) {
            console.warn(`Link source "${props.fieldConfig.datasource}" for field "${props.fieldConfig.alias}" not found`)
            return
        }
        getData()
    }

    isDisabled.value = false
}

async function getValue() {
    value.value = props.modelValue
}

async function getData() {
    isLoading.value = true;
    data.value = await dataSource.getAll()
    isLoading.value = false;
}

function change(val: string) {
    value.value = val
    emit('update:modelValue', val)
    emit('change', val)
}

</script>

<style scoped>

</style>