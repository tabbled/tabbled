<template>
    <el-color-picker :model-value="modelValue" @change="e => emit('change', e)" show-alpha :predefine="predefineColors" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface Props {
    modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'change', value: string): void
}>()
const color = ref('rgba(255, 69, 0, 0.68)')
const predefineColors = ref([
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
    '#c7158577',
])
</script>