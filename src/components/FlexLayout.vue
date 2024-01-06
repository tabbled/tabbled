<template>
    <FlexLayoutDropZone :screen-size="screenSize"
                        :elements="elements"
                        :direction="direction"
                        :selected="selected"
                        :id="id"
                        :context="context"
                        :parent="parent"
                        v-bind="props"
                        :mode="mode"
                        :style="customStyle ? JSON.parse(customStyle) : style_"
    />
</template>

<script setup lang="ts">

import FlexLayoutDropZone from "./FlexLayoutDropZone.vue";
import {ScreenSize} from "../model/page";

interface Props {
    screenSize: ScreenSize,
    elements: any,
    mode?: 'design' | 'view',
    direction: 'row' | 'column'
    selected: string,
    parent: string,
    id: string,
    context: any
    customStyle?: any
}

const props = withDefaults(defineProps<Props>(), {
    screenSize: ScreenSize.desktop,
    elements: [],
    mode: "design",
    direction: "column",
    selected: '',
    parent: '',
    style: {
        padding: "16px"
    }
})

let style_ = {
    padding: "16px"
}

</script>

<style scoped>

</style>