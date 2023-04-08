<template>
    <el-select v-if="_field && _field.type === 'link'"
                  filterable
                  :model-value="value"
                  :disabled="isDisabled"
                  remote
                  clearable
                  remote-show-suffix
                  :remote-method="getData"
                  :loading="isLoading"
                  @change="(val) => change(val)"
    >
        <el-option
            v-for="item in data"
            :key="item[keyProp]"
            :label="item[displayProp]"
            :value="item[keyProp]"
        />
    </el-select>
    <el-select v-else-if="_field && _field.type === 'enum'"
               filterable
               :model-value="value"
               :disabled="isDisabled"
               clearable
               @change="(val) => change(val)"
    >
        <el-option
            v-for="item in _field.values"
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
import {DataSet} from "../model/dataset";
import {useDataSourceService} from "../services/datasource.service";

let isLoading = ref(false)
let data = ref<Array<object>>([])
let source: DataSourceInterface = null
let _field = ref<FieldConfigInterface>(null)
let value = ref(getValue())
let isDisabled = ref(true)
let dsService = useDataSourceService()
let linkSource:DataSourceInterface = null

interface Props {
    field: string,
    modelValue?: string | number,
    dataSet: DataSet,
    keyProp?: string,
    displayProp?: string
}


const props = withDefaults(defineProps<Props>(), {
    keyProp: "id",
    displayProp: "name"
})

const emit = defineEmits(['change'])

watch(() => props.dataSet,
    async () => {
        if (props.dataSet.isOpen) {
            value.value = getValue()
            isDisabled.value = false
        }

    },
    {
        deep: true
    })

onMounted(() => {
    if (!props.dataSet)
        return;

    source = props.dataSet.dataSource
    if (!source) {
        console.warn(`DataSource "${props.field}" is not found`)
        return;
    }

    _field.value = source.getFieldByAlias(props.field)

    if (!_field) {
        console.warn(`Field "${props.field}" not found`)
        return;
    }
    linkSource = dsService.getDataSourceByAlias(_field.value.datasource)

    if (!linkSource) {
        console.warn(`Link source "${_field.value.datasource}" for field "${props.field}" not found`)
        return
    }

    if (_field.value.type == 'link') {
        isDisabled.value = false
        getData()
    }

    if (_field.value.type == 'enum') {
        isDisabled.value = false
        data.value = _field.value.values;
    }
})

function getValue() : string | number {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    return props.dataSet.current[props.field]
}

async function getData() {
    if (!linkSource || !_field)
        return;

    isLoading.value = true;
    data.value = await linkSource.getAll()

    isLoading.value = false;
}

function change(val: string) {
    emit('change', val)

    value.value = val

    if (!props.dataSet || props.field == '' || !_field) {
        console.warn(`DataSet or field haven't set`)
        return;
    }

    props.dataSet.update(props.field, val)
}

</script>

<style scoped>

</style>