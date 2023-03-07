<template>
    <el-input @input="change" :model-value="value"/>
</template>

<script setup lang="ts">
import {DataSet} from "../model/dataset";
import {ref, watch} from "vue";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: string,
    dataSet?: DataSet,
    field?: string,
    context?:any,
}>()

let value = ref(getValue())

function getValue():string {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    return props.dataSet.current[props.field]
}

watch(() => props.dataSet,
    async () => {
        if (props.dataSet.isOpen)
            value.value = getValue()
    },
    {
        deep: true
    })

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