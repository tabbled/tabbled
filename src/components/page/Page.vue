<template>
    <div class="page-view" >
        <el-page-header ref="mainHeader" class="list-page-view-header" @back="$router.back()">
            <template #content>
                <div class="page-title">
                    <span> {{title}} </span>
                    <el-button type="info" text circle :icon="SettingsIcon" @click="emit('settingsRequest')"/>

                </div>
            </template>
            <template #extra>
                <div class="page-actions" >
                    <el-button v-if="page.isPropsChanged" size="small" type="warning" @click="page.saveChanges()">Publish changes</el-button>
                </div>
            </template>
        </el-page-header>
        <Grid class="page-grid" path="" :elements="elements"/>

    </div>
</template>

<script setup lang="ts">
import Grid from "../Grid.vue";
import SettingsIcon from "../icons/settings-icon.vue";
import {usePage} from "../../store/pageStore";

interface Props {
    title: string
    elements: any[]
}

let page = usePage()

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'settingsRequest'): void
}>()

</script>

<style lang="scss">
.page-view {
    display: flex;
    flex-direction: column;
}

.page-title {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.page-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.page-grid {
    overflow: auto;
    height: -webkit-fill-available;
}

.page-header-content {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.list-page-view {
    display: flex;
    flex-direction: column;
}

.list-page-view-header {
    padding: 16px;
}
</style>