<template>
    <el-checkbox :label="label" :disabled="isDisabled" :model-value="value" @click="change"/>
</template>

<script setup lang="ts">
import {DataSet} from "../model/dataset";
import {onMounted, ref, UnwrapRef, watch} from "vue";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: boolean,
    dataSet?: UnwrapRef<DataSet>,
    field?: string,
    context?:any,
    label?: string
}>()

let value = ref(getValue())
let isDisabled = ref(true)

function getValue():boolean {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    let d = props.dataSet.current[props.field]

    return d === undefined || d === null ? false : props.dataSet.current[props.field]
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

    if (props.dataSet.isOpen) {
        value.value = getValue()
        isDisabled.value = false
    }



}

function change() {

    value.value = !value.value
    emit('update:modelValue', value.value)

    if (!props.dataSet || !props.field || props.field == '') {
        console.warn(`DataSet or field haven't set`)
        return;
    }

    props.dataSet.update(props.field, value.value)
}

</script>

<style scoped>

</style>