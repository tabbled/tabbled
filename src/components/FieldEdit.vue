<template>
    <el-form ref="formRef" :model="modelValue" label-width="100px">
        <el-form-item :label="t('fieldConfig.title')" prop="title">
            <el-input v-model="modelValue.title"/>
        </el-form-item>

        <el-form-item :label="t('fieldConfig.alias')" prop="alias">
            <el-input v-model="modelValue.alias"></el-input>
        </el-form-item>

        <el-form-item :label="t('fieldConfig.type')">
            <el-select v-model="modelValue.type" >
                <el-option
                    v-for="item in fieldTypes"
                    :key="item.key"
                    :label="item.label"
                    :value="item.key"
                >
                </el-option>
            </el-select>
        </el-form-item>


        <el-form-item v-if="modelValue.type === 'link' || modelValue.type === 'table'"
                      :label="t('fieldConfig.datasource')">
            <el-select v-model="modelValue.datasource" >
                <el-option
                    v-for="item in dataSources"
                    :key="item.key"
                    :label="item.label"
                    :value="item.key"
                >
                </el-option>
            </el-select>
        </el-form-item>



        <el-form-item v-if="modelValue.type === 'number'" :label="t('fieldConfig.precision')">
            <el-input-number v-model="modelValue.precision" controls-position="right" :min="0" :max="9" style="text-align: start"></el-input-number>
        </el-form-item>

        <el-form-item v-if="modelValue.type === 'link' || modelValue.type === 'list'" :label="t('fieldConfig.isMultiple')">
            <el-checkbox v-model="modelValue.isMultiple"></el-checkbox>
        </el-form-item>

        <el-form-item v-if="modelValue.type !== 'table'" :label="t('fieldConfig.default')">
            <el-input v-model="modelValue.default"></el-input>
        </el-form-item>
    </el-form>

</template>

<script setup lang="ts">

import {FieldConfigInterface, getFieldDataTypes} from "../model/field";
import {useI18n} from "vue-i18n";
import {onMounted, ref} from "vue";
import {useDataSourceService} from "../services/datasource.service";

const { t } = useI18n();

interface ListItem {key: string, label: string}

const fieldTypes = ref<Array<ListItem>>([])
const dataSources = ref<Array<ListItem>>([])

let dsService = useDataSourceService()

onMounted(async () => {
    getFieldDataTypes().forEach(key => {
        fieldTypes.value.push({
            key: key,
            label: t(`fieldTypes.${key}`)
        })
    })

    dsService.getDataSources().forEach(item => {
        console.log(item)
        dataSources.value.push({
            key: item.alias,
            label: item.alias
        })
    })
});

const props = defineProps<{
    modelValue: FieldConfigInterface
}>()

const emit = defineEmits(['update:modelValue'])



</script>

<style scoped>

</style>