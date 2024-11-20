
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M5 17V7h2v4h4V7h2v10h-2v-4H7v4H5Zm12 0V9h-2V7h4v10h-2Z"></path></svg>
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