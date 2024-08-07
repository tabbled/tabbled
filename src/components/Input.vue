<template>
    <el-input
        v-if="!fieldConfig"
        disabled
    />
    <div v-if="fieldConfig && fieldConfig.isMultiple" style="width: 100%">
        <ItemList key-prop="alias"
                  title-prop="title"
                  :list="multiValue"
                  @remove="(row) => multiValue.splice(row, 1)"
                  @insert="multiValue.push('')"
        >
            <template #default="{item, index}">
                <el-input style="padding: 8px 4px 4px 8px; width: calc(100% - 24px)" :disabled="isDisabled" @input="(val) => inputMulti(val, index)" :model-value="multiValue[index]"/>
            </template>
        </ItemList>
    </div>
    <div v-else-if="fieldConfig" style="width: 100%">
        <el-input v-if="fieldConfig.type !== 'number'"
                  :disabled="disabled || isDisabled"
                  @input="change"
                  :model-value="value"
                  :type="type"
                  :show-password="type === 'password'"
                  :readonly="!!readonly"
                  :autosize="autosize ? { minRows: 2, maxRows: 100} : false"
        />
        <el-input-number v-if="fieldConfig.type === 'number'"
                         :disabled="disabled || isDisabled"
                         @input="change"
                         :controls="false"
                         :precision="fieldConfig.precision ? fieldConfig.precision : 0"
                         :model-value="Number(value)"
                         :readonly="!!readonly"
                         style="width: 100%; text-align: left !important;"
                         type="type"/>
    </div>

</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";
import ItemList from "./ItemList.vue";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    id?: string,
    modelValue?: any,
    field: string,
    fieldConfig: FieldConfigInterface,
    context?:any,
    autosize?: boolean,
    disabled?: boolean,
    readonly?: boolean,
    password?:boolean,
    title?: string,
    customStyle?: string,
    visible?: any
}>()

let value = ref<string | Array<string>>()
let multiValue = ref<Array<string>>([])
let type = ref<'text' | 'textarea' | 'password'>('text')
let isDisabled = ref(false)


onMounted(async () => {
    init()
    await getValue()
})

watch(() => props.modelValue,
    async () => {
        init()
        await getValue()
    })

watch(() => props.fieldConfig,
    async () => {
        init()
    })


async function getValue() {
    if (props.modelValue && props.fieldConfig && props.fieldConfig.isMultiple) {
        multiValue.value = (props.modelValue instanceof Array) ? props.modelValue : [props.modelValue]
        return;
    }
    value.value = props.modelValue
}

function inputMulti(val, index) {
    multiValue.value[index] = val
    emit('change', multiValue.value)
}

function init() {
    if (props.fieldConfig) {
        switch (props.fieldConfig.type) {
            case "text": type.value = 'textarea'; break;
            case "password": type.value = 'password'; break;
            default: type.value = 'text';
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

<style lang="scss">
.el-input-number .el-input__inner {
    text-align: left;
}
</style>