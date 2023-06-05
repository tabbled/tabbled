<template>
    <div>Custom filter</div>
    <div>{{modelValue}}</div>
</template>

<script lang="ts" setup>

interface Props {
    modelValue: any
}

const props = withDefaults(defineProps<Props>(), {
})

const emit = defineEmits(['update:modelValue'])

</script>

<style scoped>

</style>