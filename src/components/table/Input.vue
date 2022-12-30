<template>
    <el-input
        ref="el"
        class="table-input"
        :model-value="modelValue"
        @mouseenter="handleMouseEnter"
        @input="handleInput"
    />
</template>

<script setup lang="ts">

import {ref} from "vue";

defineProps(['modelValue'])
let emit = defineEmits(['update:modelValue'])

let el = ref(null)

function handleMouseEnter() {
    if (el.value)
        el.value.focus()
}

function handleInput(value: string | number) {
    emit('update:modelValue', value)

}

</script>

<style lang="scss">

.table-input {
    margin: 0;
    padding: 0;
    height: calc(32px - 2px);

    .el-input__wrapper {
        border-radius: unset;
        box-shadow: unset;
        margin: 1px;
        padding-left: 7px;

        input {
            font-family: inherit;
        }

    }
}

</style>