<template>
    <el-tabs ref="tabsEl"
             tab-position="left"
             class="h-full pl-8 tabs-config-content"
             v-model="activeTab"
             >
        <el-tab-pane :label="$t('pages')" name="pages">
        </el-tab-pane>
        <el-tab-pane :label="$t('datasource')" name="datasource">
        </el-tab-pane>
        <el-tab-pane :label="$t('functions')" name="functions">
        </el-tab-pane>
        <el-tab-pane :label="$t('reportTemplates')" name="reportTemplates" class="h-full">
            <ReportTemplates class="h-full w-full"/>
        </el-tab-pane>
        <el-tab-pane name="processes" disabled>
            <template #label><el-tag type="info" style="margin-right: 8px">{{$t('soon')}}</el-tag> {{$t('processes')}}</template>
        </el-tab-pane>
        <el-tab-pane name="events" disabled>
            <template #label><el-tag type="info" style="margin-right: 8px">{{$t('soon')}}</el-tag> {{$t('events')}}</template>
        </el-tab-pane>
        <el-tab-pane name="users">
            <template #label> {{$t('users')}}</template>
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">

import {ref} from "vue";
import ReportTemplates from "./reports/ReportTemplates.vue";
let activeTab = ref('pages')


</script>

<style lang="scss">

</style>