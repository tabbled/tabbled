<template>
    <el-form ref="formRef" :model="modelValue" label-width="100px">

        <el-form-item :label="t('menuConfig.title')" prop="alias">
            <el-input v-model="modelValue.title"></el-input>
        </el-form-item>

        <el-form-item :label="t('menuConfig.path')" prop="path">
            <el-input v-model="modelValue.path"></el-input>
        </el-form-item>

        <el-form-item :label="t('menuConfig.path')" prop="path">
            <el-input v-model="modelValue.page"></el-input>
        </el-form-item>

        <el-form-item :label="t('menuConfig.icon')" prop="icon">
            <el-input v-model="modelValue.icon"></el-input>
        </el-form-item>

    </el-form>

</template>

<script setup lang="ts">

import {onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {MenuConfigInterface} from "../model/menu";
const { t } = useI18n();

onMounted(async () => {
});

const props = defineProps<{
    modelValue: MenuConfigInterface
}>()

const emit = defineEmits(['update:modelValue'])



</script>

<style scoped>

</style>