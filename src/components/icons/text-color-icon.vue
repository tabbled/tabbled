
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M2 24v-4h20v4H2Zm3.5-7l5.25-14h2.5l5.25 14h-2.4l-1.25-3.6H9.2L7.9 17H5.5Zm4.4-5.6h4.2l-2.05-5.8h-.1L9.9 11.4Z"></path></svg>
</template>

<script lang="ts" setup>
interface Props {
    width?: number
    height?: number
}

const props = withDefaults(defineProps<Props>(), {
    width: 24,
    height: 24
})
</script>