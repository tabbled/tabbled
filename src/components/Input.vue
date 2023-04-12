<template>
    <el-input :disabled="isDisabled" @input="change" :model-value="value" :type="type"/>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: any,
    field: string,
    fieldConfig: FieldConfigInterface,
    context?:any
}>()

let value = ref('')
let type: 'text' | 'textarea' = 'text'
let isDisabled = ref(false)


onMounted(() => {
    init()
})

watch(() => props.modelValue,
    async () => {
        init()
        await getValue()
    })


async function getValue() {
    value.value = props.modelValue
}

function init() {
    if (props.fieldConfig) {
        switch (props.fieldConfig.type) {
            case "text": type = 'textarea'; break;
            default: type = 'text';
        }
    }
    isDisabled.value = !(!!props.fieldConfig)

}

function change(val) {
    value.value = val
    emit('update:modelValue', val)
    emit('change', val)
}

</script>

<style scoped>

</style>