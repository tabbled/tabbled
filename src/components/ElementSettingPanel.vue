<template>
    <div class="panel">
        <div class="border"/>
        Settings
    </div>
</template>

<script setup lang="ts">

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