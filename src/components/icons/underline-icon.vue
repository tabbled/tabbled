
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21v-2h14v2H5Zm7-4q-2.525 0-3.925-1.575t-1.4-4.175V3H9.25v8.4q0 1.4.7 2.275t2.05.875q1.35 0 2.05-.875t.7-2.275V3h2.575v8.25q0 2.6-1.4 4.175T12 17Z"></path></svg>
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