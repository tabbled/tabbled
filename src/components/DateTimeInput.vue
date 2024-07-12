<template>
    <el-date-picker
        v-model="value"
        style="width: 100%"
        :type="type"
        placeholder="Select date and time"
        @change="change"
        :disabled="isDisabled"
        :format="format"
        :readonly="readonly"
        :firstDayOfWeek="1"

    />
</template>

<script setup lang="ts">
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref, watch} from "vue";
import {DataSourceInterface} from "../model/datasource";

let source: DataSourceInterface = null
let value = ref(null)
let isDisabled = ref(true)

interface Props {
    modelValue: any,
    field: string,
    fieldConfig: FieldConfigInterface,
    context?:any,
    format?: string,
    type?: string,
    readonly?:boolean
}

const props = withDefaults(defineProps<Props>(), {
    format: "",
    type: 'datetime'
})

const emit = defineEmits(['change', 'update:modelValue'])


onMounted(async () => {
    await init()
    await getValue()
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
        await getValue()
    })


watch(() => props.modelValue,
    async () => {
        init()
        await getValue()
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