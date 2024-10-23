<template>
    <div v-if="visible"
        class="context-menu"
        :style="{ top: y + 'px', left: x + 'px' }"
    >
        <div v-for="action in actions"
             :key="action.action">
            <div v-if="action.action !== 'divider'" class="context-menu-action"
                 @click="onClick(action)">
                {{ action.title }}
            </div>
            <div v-else class="context-menu-divider"/>
        </div>

    </div>
    <div v-if="visible"
         class="overlay" @contextmenu.prevent="emit('update:visible', false)" @click="emit('update:visible', false)" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import {ContextMenuAction} from "./tableV2/context-menu-action";


interface Props {
    actions: ContextMenuAction[],
    x: number,
    y: number,
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    x: 0,
    y: 0,
    actions: () => [],
    visible: false
})

const emit = defineEmits<{
    (e: 'action-clicked', action: ContextMenuAction): string
    (e: 'update:visible', visible: boolean): string
}>()


const onClick = (action) => {
    if (action.onClick instanceof Function) {
        action.onClick()
    }
    emit('action-clicked', action)
    emit('update:visible', false)
}

</script>

<style scoped>
.context-menu {
    position: fixed;
    box-shadow: var(--el-box-shadow-light);
    min-width: 150px;
    z-index: 5000;
    padding-top: 4px;
    padding-bottom: 4px;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    color: var(--el-text-color-regular);
    font-size: var(--el-font-size-base);
    line-height: 1.4;
    border-radius: 4px;
}

.context-menu-action {
    padding: 8px 14px;
    cursor: pointer;
}

.context-menu-divider {
    border-bottom: 1px solid var(--el-border-color);
    cursor: pointer;
    margin: 2px 0;
}

.context-menu-action:hover {
    background: var(--el-border-color-extra-light);
    color: var(--el-color-primary);
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: 49;
}

.overlay::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
}

</style>