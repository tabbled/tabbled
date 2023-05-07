<template>
    <el-date-picker
        v-model="value"
        :type="fieldConfig ? fieldConfig.type : 'datetime'"
        placeholder="Select date and time"
        @change="change"
        :disabled="isDisabled"
        :format="format"
    />
</template>

<script setup lang="ts">
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref, watch} from "vue";
import {DataSourceInterface} from "../model/datasource";

let isLoading = ref(false)
let source: DataSourceInterface = null
let value = ref(null)
let isDisabled = ref(true)

interface Props {
    modelValue?: any,
    field: string,
    fieldConfig: FieldConfigInterface,
    context?:any,
    format?: string
}

const props = withDefaults(defineProps<Props>(), {
    format: ""
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

watch(() => props.fieldConfig,
    async () => {
        init()
    })

async function getValue() {
    value.value = props.modelValue
}

function change(val) {
    value.value = val
    emit('update:modelValue', val)
    emit('change', val)
}

</script>

<style scoped>

</style>