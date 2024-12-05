<template>
<div v-if="modelValue" class="flex flex-col gap-4">
    <div class="flex flex-row items-center gap-4">
        <label for="urlTitle" class="w-28 flex-none">{{$t('menuConfig.title')}}</label>
        <el-input id="urlTitle" :size="size" v-model="modelValue.title"/>
    </div>
    <div class="flex flex-row items-center gap-4">
        <label for="urlIcon" class="w-28 flex-none">{{$t('menuConfig.icon')}}</label>
        <el-input id="urlIcon" :size="size" v-model="modelValue.icon"/>
    </div>
    <div class="flex flex-row items-center gap-4">
        <label for="pathInput" class="w-28 flex-none">{{$t('menuConfig.path')}}</label>
        <el-input id="pathInput" :size="size" v-model="modelValue.path"/>
    </div>
    <div class="flex flex-row items-center gap-4">
        <label for="templateInput" class="w-28 flex-none">{{$t('menuConfig.template')}}</label>
        <el-select id="templateInput" :size="size"
                   v-model="modelValue.template" clearable>
            <el-option
                v-for="item in templates"
                :label="item.title"
                :value="item.id"
            />
        </el-select>
    </div>


    <div class="flex flex-row items-center gap-4">
        <label for="rolesInput" class="w-28 flex-none">{{$t('menuConfig.visibility')}}</label>
        <el-select id="rolesInput" v-model="modelValue.visibility" :size="size">
            <el-option
                v-for="item in getAccessTypes(t)"
                :key="item.alias"
                :label="item.title"
                :value="item.alias"
            />
        </el-select>
        <UserRoleSelect size="small" v-if="modelValue.visibility === 'roles'" v-model="modelValue.visibilityRoles"/>
    </div>
</div>
</template>

<script setup lang="ts">
import {ref} from "vue"
import UserRoleSelect from "../../../components/UserRoleSelect.vue";
import {getAccessTypes} from "../../../model/permissions";
import {useI18n} from "vue-i18n";
const { t } = useI18n();


class TemplateDto {
    id: string
    title: string
    data: string
}

const props = defineProps<{
    size: 'small' | 'default',
    modelValue: any
}>()

const templates = ref<TemplateDto[]>([])

</script>

<style scoped>

</style>