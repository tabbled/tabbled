<template>
    <el-input
        ref="el"
        class="table-input"
        clearable
        :model-value="modelValue"
        @mouseenter="handleMouseEnter"
        @input="$emit('update:title', $event.target.value)"
    />
</template>

<script setup lang="ts">

import {ref} from "vue";

defineProps(['modelValue'])
defineEmits(['update:modelValue'])

let el = ref(null)

function handleMouseEnter() {
    if (el.value)
        el.value.focus()
}

</script>

<style lang="scss">

.table-input {
    margin: 0;
    padding: 0;
    height: calc(var(--el-input-height, 32px) - 4px);


    .el-input__wrapper {
        border-radius: unset;
        box-shadow: unset;
        margin: 1px;
    }
}

</style>