
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M13 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h9V2h-9m7 8v4h-7v-4h7m0 6v4h-7v-4h7m0-12v4h-7V4h7M9 11H6V8H4v3H1v2h3v3h2v-3h3v-2Z"></path></svg>
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