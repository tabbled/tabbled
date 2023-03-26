<template>
    <el-input :disabled="isDisabled" @input="change" :model-value="value" :type="type"/>
</template>

<script setup lang="ts">
import {DataSet} from "../model/dataset";
import {onMounted, ref, UnwrapRef, watch} from "vue";
import {FieldConfigInterface} from "../model/field";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: string,
    dataSet?: UnwrapRef<DataSet>,
    field?: string,
    context?:any,
}>()

let value = ref(getValue())
let _field: FieldConfigInterface = null
let type: 'text' | 'textarea' = 'text'
let isDisabled = ref(true)

function getValue():string {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    return props.dataSet.current[props.field]
}

onMounted(() => {
    init()
})

watch(() => props.dataSet,
    async () => {
        init()
    },
    {
        deep: true
    })

function init() {
    if (!props.dataSet)
        return;

    _field = props.dataSet.dataSource.getFieldByAlias(props.field)

    switch (_field.type) {
        case "text": type = 'textarea'; break;
        default: type = 'text';
    }

    if (props.dataSet.isOpen) {
        value.value = getValue()
        isDisabled.value = false
    }



}

function change(val) {
    value.value = val
    emit('update:modelValue', val)

    if (!props.dataSet || !props.field || props.field == '') {
        console.warn(`DataSet or field haven't set`)
        return;
    }

    props.dataSet.update(props.field, val)
}

</script>

<style scoped>

</style>