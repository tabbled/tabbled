<template>
    <FlexLayoutDropZone :screen-size="screenSize"
                        :elements="elements"
                        :direction="direction"
                        :selected="selected"
                        :id="id"
                        :parent="parent"/>
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
    id: string
}

const props = withDefaults(defineProps<Props>(), {
    screenSize: ScreenSize.desktop,
    elements: [],
    mode: "design",
    direction: "column",
    selected: '',
    parent: ''
})

</script>

<style scoped>

</style>