<template>
    <div class="wrapper">
        <component :is="component" v-bind="properties" style="height: inherit"/>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    component: string
    properties: object
}>()

</script>

<style lang="scss">

.wrapper {
    display: flex;
    flex-direction: row;
    background: #f9f9f9;
    border-radius: 2px;
    border-style: solid;
    border-width: thin;
    z-index: 0;
    border-color: #00000012;
    overflow: hidden;
}

.description {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    flex-direction: column;
}

.title {
    width: 100%;
    margin: 0;
    line-height: 1;
    font-size: var(--el-font-size-base);
    flex-direction: column;
    align-self: center;
    font-weight: 500;
    padding-top: 4px
}

.subtitle {
    width: 100%;
    margin: 0;
    font-size: var(--el-font-size-extra-small);
    line-height: 1;
    padding-bottom: 4px;
}

.icon {
    width: 24px;
    height: 24px;
    padding: 6px;
    vertical-align: middle;
    color: var(--el-border-color);
}

</style>