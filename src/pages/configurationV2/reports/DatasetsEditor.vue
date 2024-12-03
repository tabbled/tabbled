<template>
    <div class="flex flex-row">
        <div class="rounded flex flex-col w-1/5">
            <div class="flex flex-row items-center gap-2 mb-6">
                <el-button size="small" @click="add">{{$t('add')}}</el-button>
            </div>
            <List :items="modelValue" title-prop="alias" key-prop="alias" v-model:current-index="currentIndex" >
                <template #icon>

                </template>
            </List>
        </div>
        <DatasetItemEditor v-model="currentDataset" class="border shadow-xl rounded flex flex-col w-4/5 ml-6" @remove="remove"/>

    </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {DatasetDto} from "./report.dto";
import List from "../../../components/list/List.vue";
import DatasetItemEditor from "./DatasetItemEditor.vue";

const emit = defineEmits(['update:modelValue'])
const currentIndex = ref<number>(null)
const currentDataset = ref<DatasetDto>(null)

const props = defineProps<{
    modelValue?: DatasetDto[],
}>()

watch(() => currentIndex.value, () => {
    console.log(currentIndex.value)
    currentDataset.value = props.modelValue[currentIndex.value]
})

const add = () => {
   props.modelValue.push({
       alias: "dataset" + (props.modelValue.length + 1),
       sort: [],
       fields: [],
       groupBy: [],
       filterBy: ""
   })
    currentDataset.value = props.modelValue[props.modelValue.length-1]
    currentIndex.value = props.modelValue.length-1
}

const remove = () => {
    props.modelValue.splice(currentIndex.value, 1)
    currentIndex.value = -1
    currentDataset.value = null
}

</script>

<style scoped>

</style>