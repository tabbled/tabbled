<template>
        <table class="border-collapse text-left">
            <colgroup>
                <col style="">
                <col v-if="groupBy.length" style="width: 80px">
                <col style="width: 10px;">
            </colgroup>
            <thead>
                <tr class="text-base">
                    <th class="font-medium text-neutral-400">{{$t('report.dataset.field.alias')}}</th>
                    <th class="pl-2 font-medium text-neutral-400" v-if="groupBy.length">{{$t('report.dataset.field.aggFunc')}}</th>
                    <th/>
                </tr>
            </thead>
            <tbody>
            <tr v-for="(item, idx) in modelValue" >
                <td class="pt-1 pb-1">
                    <el-select v-model="item.alias" size="small">
                        <el-option v-for="item in datasourceFields"
                                   :value="item.alias"
                                   :label="`${item.title} (${item.alias})`"/>
                    </el-select>
                </td>
                <td v-if="groupBy.length" class="pt-1 pb-1 pl-2">
                    <el-select :disabled="groupBy.includes(item.alias)" v-model="item.aggFunc" size="small">
                        <el-option value="none" label="No"/>
                        <el-option value="sum" label="Sum"/>
                        <el-option value="avg" label="Avg"/>
                        <el-option value="min" label="Min"/>
                        <el-option value="max" label="Max"/>
                    </el-select>
                </td>
                <td class="text-right pt-1 pb-1 pl-2">
                    <el-button class="opacity-60" size="small" text @click="remove(idx)" style="width: 20px">
                        <DeleteIcon :width="16" :height="16"/>
                    </el-button>
                </td>
            </tr>
            <tr>
                <th>
                    <el-button size="small" text @click="add" class="pl-0 mt-2">
                        <AddIcon :height="16" :width="16" style="margin-right: 4px"/>
                        {{$t('add')}}
                    </el-button>
                </th>
            </tr>
            </tbody>
            <tfoot>

            </tfoot>
        </table>

</template>

<script setup lang="ts">
import {DatasetFieldDto} from "./report.dto";
import Table from "../../../components/Table.vue";
import {FieldInterface} from "../../../model/field";
import DeleteIcon from "../../../components/icons/delete-icon.vue";
import AddIcon from "../../../components/icons/add-icon.vue";

const emit = defineEmits(['update:modelValue'])

const props = defineProps<{
    modelValue: DatasetFieldDto[],
    groupBy: string[],
    datasourceFields: FieldInterface[]
}>()

const add = () => {
    props.modelValue.push({
        alias: "",
        type: 'data',
        aggFunc: "none"
    })
}

const remove = (idx) => {
    props.modelValue.splice(idx, 1)
}

</script>

<style scoped>

</style>