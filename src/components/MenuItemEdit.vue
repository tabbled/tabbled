<template>
    <el-form ref="formRef" :model="modelValue" label-width="100px" label-position="left">

        <el-form-item :label="t('menuConfig.title')" prop="alias">
            <el-input v-model="modelValue.title"></el-input>
        </el-form-item>

        <el-form-item :label="t('menuConfig.path')" prop="path">
            <el-input v-model="modelValue.path"></el-input>
        </el-form-item>

        <el-form-item :label="t('menuConfig.page')" prop="page">
            <el-input v-model="modelValue.page"></el-input>
        </el-form-item>

        <el-form-item :label="t('menuConfig.icon')" prop="icon">
            <el-input v-model="modelValue.icon"></el-input>
        </el-form-item>

        <el-form-item :label="t('menuConfig.visibility')">
            <div style="display: flex; flex-direction: row; width: 100%">
                <el-select v-model="modelValue.visibility" style="padding-right: 8px; width: 100%">
                    <el-option
                        v-for="item in getAccessTypes(t)"
                        :key="item.alias"
                        :label="item.title"
                        :value="item.alias"
                    />
                </el-select>
                <UserRoleSelect size="default" v-if="modelValue.visibility === 'roles'" v-model="modelValue.visibilityRoles"/>
            </div>

        </el-form-item>

    </el-form>

</template>

<script setup lang="ts">

import {onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {MenuConfigInterface} from "../model/menu";
import UserRoleSelect from "./UserRoleSelect.vue";
import {getAccessTypes} from "../model/permissions";
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