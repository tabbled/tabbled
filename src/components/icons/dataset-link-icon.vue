
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M5 20q-.825 0-1.413-.588T3 18V4q0-.825.588-1.413T5 2h14q.825 0 1.413.588T21 4v7.1q-.25-.05-.488-.075T20 11h-1V4H5v14h3.1q.1.55.263 1.05T8.8 20H5Zm0-3v1V4v13Zm2-1h1.1q.2-1.225.875-2.263T10.7 12H7v4Zm0-6h4V6H7v4Zm7 11q-1.65 0-2.825-1.175T10 17q0-1.65 1.175-2.825T14 13h2v2h-2q-.825 0-1.413.588T12 17q0 .825.588 1.413T14 19h2v2h-2Zm-1-11h4V6h-4v4Zm1 8v-2h6v2h-6Zm4 3v-2h2q.825 0 1.413-.588T22 17q0-.825-.588-1.413T20 15h-2v-2h2q1.65 0 2.825 1.163T24 17q0 1.65-1.175 2.825T20 21h-2Z"></path></svg>
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