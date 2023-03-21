<template>
    <el-date-picker
        v-model="value"
        :type="_field ? _field.type : 'datetime'"
        placeholder="Select date and time"
        @change="change"
    />
</template>

<script setup lang="ts">
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref, watch} from "vue";
import {DataSourceInterface} from "../model/datasource";
import {DataSet} from "../model/dataset";

let isLoading = ref(false)
let source: DataSourceInterface = null
let _field: FieldConfigInterface = null
let value = ref(getValue())

interface Props {
    field: string,
    modelValue: string | number,
    dataSet: DataSet
}


const props = withDefaults(defineProps<Props>(), {
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
    console.log("mounted datetime")

    source = props.dataSet.dataSource
    if (!source) {
        console.warn(`DataSource "${props.field}" is not found`)
        return;
    }

    _field = source.getFieldByAlias(props.field)

    if (!_field) {
        console.warn(`Field "${props.field}" not found`)
        return;
    }

    if (_field.type !== 'datetime' && _field.type !== 'date') {
        console.warn(`Field "${_field.alias}" is not a date or datetime type`)
        return
    }
})

function getValue() : string | number {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    return props.dataSet.current[props.field]
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