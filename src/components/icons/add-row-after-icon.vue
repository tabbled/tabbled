
<template>
    <svg xmlns="http://www.w3.org/2000/svg"
         :width="width"
         :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M22 10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V3h2v2h4V3h2v2h4V3h2v2h4V3h2v7M4 10h4V7H4v3m6 0h4V7h-4v3m10 0V7h-4v3h4m-9 4h2v3h3v2h-3v3h-2v-3H8v-2h3v-3Z"></path></svg>
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