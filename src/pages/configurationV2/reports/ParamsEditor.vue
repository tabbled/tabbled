<template>
    <div class="flex flex-row">
        <div class="rounded flex flex-col w-1/5">
            <div class="flex flex-row items-center gap-2 mb-6">
                <el-button size="small" @click="add">{{$t('add')}}</el-button>
            </div>
            <List :items="modelValue" v-model:current-index="currentIndex" >
                <template #icon>
                    <FunctionIcon :width="20" :height="20" class="mr-3 text-blue-400"/>
                </template>
            </List>
        </div>

        <ParamsItemEditor :prop-aliases="getAliases()" @remove="remove" v-model="currentParam" class="w-4/5 border rounded shadow-xl ml-6"/>
    </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue"
import {ReportParameterDto} from "./report.dto";
import List from "../../../components/list/List.vue";
import FunctionIcon from "../../../components/icons/function-icon.vue";
import ParamsItemEditor from "./ParamsItemEditor.vue";

const emit = defineEmits(['update:modelValue'])
const currentIndex = ref<number>(null)
const currentParam = ref<ReportParameterDto>(null)

const props = defineProps<{
    modelValue?: ReportParameterDto[],
}>()

watch(() => currentIndex.value, () => {
    currentParam.value = props.modelValue[currentIndex.value]
})

const add = () => {
    props.modelValue.push({
        alias: "param",
        title: "New parameter"
    })

    currentParam.value = props.modelValue[props.modelValue.length-1]
    currentIndex.value = props.modelValue.length-1
}

const remove = () => {
    props.modelValue.splice(currentIndex.value, 1)
    currentIndex.value = -1
    currentParam.value = null
}

const getAliases = () => {
    let d = props.modelValue.map(m => m.alias)
    d.splice(currentIndex.value, 1)
    return d
}

</script>

<style scoped>

</style>