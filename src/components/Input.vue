<template>
    <div v-if="fieldConfig && fieldConfig.isMultiple">
        <ItemList key-prop="alias"
                  title-prop="title"
                  :list="multiValue"
                  @remove="(row) => multiValue.splice(row, 1)"
                  @insert="multiValue.push('')"
        >
            <template #default="{item, index}">
                <el-input style="padding-left: 8px; width: calc(100% - 24px)" :disabled="isDisabled" @input="(val) => inputMulti(val, index)" :model-value="multiValue[index]"/>
            </template>
        </ItemList>
    </div>
    <el-input v-else :disabled="isDisabled" @input="change" :model-value="value" :type="type"/>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";
import ItemList from "./ItemList.vue";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: any,
    field: string,
    fieldConfig: FieldConfigInterface,
    context?:any
}>()

let value = ref<string | Array<string>>()
let multiValue = ref<Array<string>>([])
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
    if (props.modelValue && props.fieldConfig && props.fieldConfig.isMultiple) {
        multiValue.value = (props.modelValue instanceof Array) ? props.modelValue : [props.modelValue]
        return;
    }
    value.value = props.modelValue
}

function inputMulti(val, index) {
    console.log(val, index)
    multiValue.value[index] = val
    emit('change', multiValue.value)
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