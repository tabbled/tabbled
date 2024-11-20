
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M5 10H3V4h8v2H5v4m14 8h-6v2h8v-6h-2v4M5 18v-4H3v6h8v-2H5M21 4h-8v2h6v4h2V4M8 13v2l3-3l-3-3v2H3v2h5m8-2V9l-3 3l3 3v-2h5v-2h-5Z"></path></svg>
</template>

<script setup lang="ts">
interface Props {
    width?: number
    height?: number
}

const props = withDefaults(defineProps<Props>(), {
    width: 24,
    height: 24
})
</script>