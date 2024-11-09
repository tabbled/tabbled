<template>
    <div v-if="elements && elements.length" class="grid-wrapper">

        <div v-for="(element, idx) in elements"
             class="grid-element-wrapper"
             :style="{'grid-column': `span ${element.colSpan}`,
             height: element.properties['height'] ? element.properties['height'] : 'fit-content'}">

            <component :id="element.id"
                       :is="element.componentName"
                       v-bind="element.properties"
                       :path="getElementPath(idx)"
                       :parentPath="path"
            />
        </div>
    </div>

</template>

<script setup lang="ts">

import {onMounted} from "vue";
import {ElementInterfaceV2} from "../model/page";

const emit = defineEmits<{
    (e: 'update:property', path: string, value: any): string
}>()

const props = defineProps<{
    elements: ElementInterfaceV2[],
    path: string
}>()

onMounted(() => {
})

const getElementPath = (idx) => {
    return `${props.path ? `${props.path}.` : ''}elements[${idx}]`
}

</script>

<style lang="scss">
.grid-wrapper {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: max-content;
    gap: 16px;
}

.grid-element-wrapper {
    position: relative;
    overflow: hidden;
}

.grid-element-settings-panel {
    opacity: 0;
    right: 100%;
    z-index: 100;
    border-radius: 0 3px 0 3px;
    box-shadow: inset 0 0 0 1px var(--el-color-primary) ;
    transition: border 1.44s ease;
}

.grid-element-wrapper:hover .grid-element-settings-panel {
    opacity: 1;
}
</style>