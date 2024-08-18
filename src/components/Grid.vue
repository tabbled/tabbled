<template>
    <div v-if="elements && elements.length" class="grid-wrapper">
        <div v-for="(element, idx) in elements" class="grid-element-wrapper" :style="{'grid-column': `span ${element.colSpan}`}">
            <component :id="element.id"
                       :is="element.componentName"
                       v-bind="element.properties"
                       :path="getElementPath(idx)"
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
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 10px;
}

.grid-element-wrapper {

}
</style>