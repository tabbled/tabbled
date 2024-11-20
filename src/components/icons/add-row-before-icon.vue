
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width"
         :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M22 14a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7h2v-2h4v2h2v-2h4v2h2v-2h4v2h2v-7M4 14h4v3H4v-3m6 0h4v3h-4v-3m10 0v3h-4v-3h4m-9-4h2V7h3V5h-3V2h-2v3H8v2h3v3Z"></path></svg>
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