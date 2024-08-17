<template>
    <div :class="{'settings-panel': true,  'unpinned': !isPinned, 'pinned': isPinned, 'sidebar-hidden': !page.propertiesPanelVisible}">
        <div class="sidebar-header" >
            <span>{{title}}</span>
            <div>
                <el-button @click="togglePin"
                           text
                           circle
                           :icon="isPinned ? UnpinIcon : PinIcon"/>

                <el-button text
                           :icon="CloseIcon"
                           circle
                           @click="close()"/>
            </div>
        </div>

        <div style=" overflow:auto;">
            <SettingsPanel />
        </div>

    </div>
</template>


<script setup lang="ts">

import {computed, ComputedRef, onMounted, ref} from "vue";
import UnpinIcon from "./icons/unpin-icon.vue";
import PinIcon from "./icons/pin-icon.vue";
import CloseIcon from "./icons/close-icon.vue";
import SettingsPanel from "./SettingsPanel.vue"
import {usePage} from "../store/pageStore";

let isPinned = ref(true)


let title = ref('Settings')

let page = usePage()


const emit = defineEmits([])

const props = defineProps<{
    width: number
}>()

const minWidth: ComputedRef<string> = computed((): string =>  {
    return props.width +  'px'
})

onMounted(async () => {
    let state = localStorage.getItem(`right-sidebar-pinned`)
    isPinned.value = state === 'true'
})

let togglePin = () => {
    isPinned.value = !isPinned.value
    localStorage.setItem('right-sidebar-pinned', String(isPinned.value))
}

let close = () => {
    page.closeSetting()
}

</script>

<style lang="scss">

.settings-panel {
    display: block;
    z-index: 100;
    min-width: v-bind(minWidth);
    background: var(--el-fill-color-blank);
    box-shadow: var(--el-box-shadow);
}

.sidebar-header {
    display: flex;
    flex-direction: row;
    padding: 8px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color);

    .el-button+.el-button {
        margin-left: 0 !important;
    }
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

.sidebar-hidden {
    display: none;
}



</style>