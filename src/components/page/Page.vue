<template>
    <div class="list-page-view" >
        <el-page-header ref="mainHeader" class="list-page-view-header" @back="$router.back()">
            <template #content>
                <span> {{title}} </span>
                <el-button type="info" text circle :icon="SettingsIcon" @click="emit('settingsRequest')"/>
            </template>
            <template #extra>
                <div class="page-actions">

                </div>
            </template>
        </el-page-header>
        <Grid class="page-grid" path="" :elements="elements"/>

    </div>
</template>

<script setup lang="ts">
import Grid from "../Grid.vue";
import SettingsIcon from "../icons/settings-icon.vue";

interface Props {
    title: string
    elements: any[]
}

const props = defineProps<Props>()


const emit = defineEmits<{
    (e: 'settingsRequest'): void
}>()

</script>

<style lang="scss">
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