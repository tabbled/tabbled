<template>
    <el-checkbox :label="label" :disabled="!(!!fieldConfig)" :model-value="value" @change="change"/>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: boolean,
    fieldConfig: FieldConfigInterface,
    field?: string,
    context?:any,
    label?: string
}>()



let value = ref(false)

function getValue() {
    value.value = props.modelValue
}

onMounted(() => {
    getValue()
})

watch(() => props.modelValue,
    async () => {
        getValue()
    })

function change() {
    value.value = !value.value
    emit('update:modelValue', value.value)
    emit('change', value.value)
}

</script>

<style scoped>

</style>