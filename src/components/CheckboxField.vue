<template>
    <el-checkbox :label="label" :disabled="isDisabled" :model-value="value" @change="change"/>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: Promise<boolean>,
    fieldConfig: FieldConfigInterface,
    field?: string,
    context?:any,
    label?: string,
    update?: number
}>()

let value = ref(false)
let isDisabled = ref(false)

async function getValue() {
    value.value = await props.modelValue
}

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

    if (!props.fieldConfig || props.fieldConfig.type !== 'bool') {
        return
    }
    isDisabled.value = false

}

function change() {
    value.value = !value.value
    emit('update:modelValue', value.value)
    emit('change', value.value)
}

</script>

<style scoped>

</style>