<template>
    <div :class="{'settings-panel': true,  'unpinned': isPinned, 'pinned': !isPinned}">
        <div @click="isPinned = !isPinned">Settings</div>

        <component ref="widgetView" :is="activeWidget" />
</div>
</template>

<script setup lang="ts">

import {ref} from "vue";

let activeWidget = ref(null)
let isPinned = ref(true)

const props = defineProps<{
}>()

let setActiveWidget = (el) => {
    activeWidget.value = el
    emit('activeWidgetChange')
}

defineExpose({setActiveWidget})
const emit = defineEmits(['close', 'activeWidgetChange'])





</script>

<style lang="scss">

.settings-panel {
    display: v-bind(displayPanel);
    z-index: 100;
    min-width: 300px;
    background: var(--el-fill-color-blank);
    opacity: v-bind(settingPanelVisible);
    box-shadow: var(--el-box-shadow);
}

.pinned {
    border-radius: 0;
    border-left: 1px solid var(--el-border-color);
    box-shadow: unset;
}

.unpinned {
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    position: absolute;
    right: 10px;
    top: 10px;
    bottom: 10px;
}

</style>