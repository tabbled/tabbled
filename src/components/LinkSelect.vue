<template>
    <el-select
                  filterable
                  :model-value="value"
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
</template>

<script setup lang="ts">
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref, watch} from "vue";
import {DataSourceInterface} from "../model/datasource";
import {DataSet} from "../model/dataset";

let isLoading = ref(false)
let data = ref<Array<object>>([])
let source: DataSourceInterface = null
let _field: FieldConfigInterface = null
let value = ref(getValue())

interface Props {
    field: string,
    modelValue: string | number,
    dataSet: DataSet,
    keyProp: string,
    displayProp: string
}


const props = withDefaults(defineProps<Props>(), {
    keyProp: "id",
    displayProp: "name"
})

const emit = defineEmits(['change'])

watch(() => props.dataSet,
    async () => {
        if (props.dataSet.isOpen)
            value.value = getValue()
    },
    {
        deep: true
    })

onMounted(() => {

    source = props.dataSet.dataSource
    if (!source) {
        console.warn(`DataSource "${props.field}" is not found`)
        return;
    }

    _field = source.getFieldByAlias(props.field)

    if (!_field) {
        console.warn(`Field "${_field.alias}" not found`)
        return;
    }

    if (_field.type !== 'link') {
        console.warn(`Field "${_field.alias}" is not a link type`)
        return
    }

    getData()
})

function getValue() : string | number {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    return props.dataSet.current[props.field]
}

async function getData(query?: string) {
    console.log(query)

    if (!source || !_field)
        return;

    isLoading.value = true;
    data.value = await source.getAll()

    isLoading.value = false;
}

function change(val: string) {
    console.log(val)
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