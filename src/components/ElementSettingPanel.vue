<template>
    <div class="panel">
        Settings
        {{element}}
    </div>
</template>

<script setup lang="ts">

import {ElementInterface, PageConfigInterface} from "../model/page";

const props = defineProps<{
    element: ElementInterface,
    page: PageConfigInterface
}>()

// watch(() => props.element,
//     async () => {
//         console.log(props.element)
//     },
//     {
//         deep: true
//     })

</script>

<style lang="scss">

.border {
    position: absolute;
    width: 1px;
    left: 1px;
    height: 100%;
    z-index: 10;
    background: var(--el-border-color);
}

.panel {
    background: white;
    z-index: 0;
}

</style>