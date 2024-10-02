<template>
    <div class="cell-renderer">{{cell?.getValue()}}</div>
</template>

<script setup lang="ts">


interface Props {
    cell: any
}

const props = withDefaults(defineProps<Props>(), {
    cell: null
})
</script>

<style lang="scss">

.cell-renderer {
    width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>