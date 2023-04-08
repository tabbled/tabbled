<template>
    <el-date-picker
        v-model="value"
        :type="fieldConfig ? fieldConfig.type : 'datetime'"
        placeholder="Select date and time"
        @change="change"
        :disabled="isDisabled"
    />
</template>

<script setup lang="ts">
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref} from "vue";
import {DataSourceInterface} from "../model/datasource";

let isLoading = ref(false)
let source: DataSourceInterface = null
let value = ref(null)
let isDisabled = ref(true)

interface Props {
    modelValue?: Promise<any>,
    field: string,
    fieldConfig: FieldConfigInterface,
    context?:any,
    update?: number
}

const props = withDefaults(defineProps<Props>(), {
})

const emit = defineEmits(['change', 'update:modelValue'])


onMounted(() => {
    init()
})

function init() {
    isDisabled.value = true
    if (!props.fieldConfig) {
        return;
    }


    if (props.fieldConfig.type !== 'datetime' && props.fieldConfig.type !== 'date') {
        console.warn(`Field "${props.fieldConfig.alias}" is not a date or datetime type`)
        return
    }

    isDisabled.value = !(!!props.fieldConfig)
}

async function getValue() {
    value.value = await props.modelValue
}

function change(val) {
    value.value = val
    emit('update:modelValue', val)
    emit('change', val)
}

</script>

<style scoped>

</style>