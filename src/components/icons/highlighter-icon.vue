<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="m3.5 18l3.15-3.15l-.05-.05q-.6-.6-.6-1.4q0-.8.6-1.4L16 2.6q.6-.6 1.4-.6q.8 0 1.4.6l2.6 2.6q.6.6.6 1.4q0 .8-.6 1.4L12 17.4q-.6.6-1.4.6q-.8 0-1.4-.6l-.05-.05l-.65.65Zm10.8-8.3Zm1.275 1.325l-2.6-2.6l-4.95 4.95l2.6 2.6ZM2 24v-4h20v4Z"></path></svg>
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