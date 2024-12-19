<template>
    <div class="flex flex-col items-start w-full gap-4">
        <div v-for="(item, idx) in modelValue" class="flex flex-row gap-4 w-full">
            <el-select v-model="item.alias" size="small" class="w-full">
                <el-option v-for="item in datasourceFields"
                           :value="item.alias"
                           :label="item.title"/>
            </el-select>
            <el-select v-model="item.order" size="small" class=" w-44">
                <el-option value="asc" label="Ascending"/>
                <el-option value="desc" label="Descending"/>
            </el-select>
            <el-button class="opacity-60" size="small" text @click="remove(idx)" style="width: 20px">
                <DeleteIcon :width="16" :height="16"/>
            </el-button>
        </div>
        <el-button size="small" text @click="add" class="pl-0">
            <AddIcon :height="16" :width="16" style="margin-right: 4px"/>
            {{$t('add')}}
        </el-button>
    </div>

</template>

<script setup lang="ts">
import {DatasetSortDto} from "./report.dto";
import {FieldInterface} from "../../../model/field";
import AddIcon from "../../../components/icons/add-icon.vue";
import DeleteIcon from "../../../components/icons/delete-icon.vue";

const emit = defineEmits(['update:modelValue'])

const props = defineProps<{
    modelValue: DatasetSortDto[],
    datasourceFields: FieldInterface[]
}>()

const add = () => {
    props.modelValue.push({
        alias: "",
        order: "asc"
    })
}

const remove = (idx) => {
    props.modelValue.splice(idx, 1)
}

</script>

<style scoped>

</style>