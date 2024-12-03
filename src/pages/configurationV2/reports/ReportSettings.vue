<template>
<div v-if="report" class="flex flex-col gap-4">
    <div class="flex flex-row items-center gap-4">
        <label for="title" class="w-44 flex-none">{{$t('report.title')}}</label>
        <el-input id="title" v-model="report.title"/>
    </div>

    <div class="flex flex-row items-center gap-4">
        <label for="desc" class="w-44 flex-none">{{$t('report.description')}}</label>
        <el-input id="desc" v-model="report.description"/>
    </div>

    <div class="flex flex-row items-center gap-4">
        <label for="layout" class="w-44 flex-none">{{$t('report.forPages')}}</label>
        <el-select id="layout" v-model="report.pages" multiple clearable>
            <el-option v-for="item in pages" :value="item.alias" :label="item.title"/>
        </el-select>
    </div>

    <div class="flex flex-row items-center gap-4">
        <label for="canView" class="w-44 flex-none">{{$t('report.canView')}}</label>
        <el-select id="canView" v-model="report.permissions.view.type">
            <el-option
                v-for="item in getAccessTypes(t)"
                :key="item.alias"
                :label="item.title"
                :value="item.alias"
            />
        </el-select>
        <UserRoleSelect v-if="report.permissions.view.type === 'roles'" v-model="report.permissions.view.roles"/>
    </div>


    <div class="flex flex-row items-center gap-4">
        <label for="layout" class="w-44 flex-none">{{$t('report.pageSettings.layout')}}</label>
        <el-select id="layout" v-model="report.pageSettings.layout">
            <el-option value="portrait" :label="$t('report.pageSettings.layoutType.portrait')"/>
            <el-option value="landscape" :label="$t('report.pageSettings.layoutType.landscape')"/>
        </el-select>
    </div>

    <div class="flex flex-row items-center gap-4">
        <label for="size" class="w-44 flex-none">{{$t('report.pageSettings.size')}}</label>
        <el-select id="size" v-model="report.pageSettings.size">
            <el-option value="Letter" label="Letter"/>
            <el-option value="Legal" label="Legal"/>
            <el-option value="Tabloid" label="Tabloid"/>
            <el-option value="Ledger" label="Ledger"/>
            <el-option value="A0" label="A0"/>
            <el-option value="A1" label="A1"/>
            <el-option value="A2" label="A2"/>
            <el-option value="A3" label="A3"/>
            <el-option value="A4" label="A4"/>
            <el-option value="A5" label="A5"/>
            <el-option value="A6" label="A6"/>
        </el-select>
    </div>

    <div class="flex flex-row items-center gap-4">
        <label for="margin" class="w-44 flex-none">{{$t('report.pageSettings.margin')}}</label>
        <el-select id="margin" v-model="report.pageSettings.margin">
            <el-option value="default" :label="$t('report.pageSettings.marginType.default')"/>
            <el-option value="custom" :label="$t('report.pageSettings.marginType.custom')"/>
        </el-select>
    </div>
    <div v-if="report.pageSettings.margin === 'custom'" class="flex flex-row items-center gap-4">
        <label for="marginTop" class="w-44 flex-none">{{$t('report.pageSettings.marginTop')}}</label>
        <el-input-number id="marginTop" v-model="report.pageSettings.marginTop"/>
    </div>
    <div v-if="report.pageSettings.margin === 'custom'" class="flex flex-row items-center gap-4">
        <label for="marginRight" class="w-44 flex-none">{{$t('report.pageSettings.marginRight')}}</label>
        <el-input-number id="marginRight" v-model="report.pageSettings.marginRight"/>
    </div>
    <div v-if="report.pageSettings.margin === 'custom'" class="flex flex-row items-center gap-4">
        <label for="marginBottom" class="w-44 flex-none">{{$t('report.pageSettings.marginBottom')}}</label>
        <el-input-number id="marginBottom" v-model="report.pageSettings.marginBottom"/>
    </div>
    <div v-if="report.pageSettings.margin === 'custom'" class="flex flex-row items-center gap-4">
        <label for="marginLeft" class="w-44 flex-none">{{$t('report.pageSettings.marginLeft')}}</label>
        <el-input-number id="marginLeft" v-model="report.pageSettings.marginLeft"/>
    </div>


</div>
</template>

<script setup lang="ts">
import {ReportDto} from "./report.dto";
import {onMounted, ref} from "vue";
import {useApiClient} from "../../../services/api.service";
import UserRoleSelect from "../../../components/UserRoleSelect.vue";
import {getAccessTypes} from "../../../model/permissions";
import {useI18n} from "vue-i18n";
const { t } = useI18n();
const api = useApiClient()
const pages = ref([])

interface Props {
    report: ReportDto
}

const props = withDefaults(defineProps<Props>(), {
    report: () => null
})

onMounted(async () => {
    try {
        pages.value.push(...(await api.get('v2/pages')).data.pages)
    } catch (e) {
        console.error(e)
    }

})




</script>

<style scoped>

</style>