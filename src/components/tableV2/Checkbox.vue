<template>
    <input
        type="checkbox"
        ref="inputRef"
        :class="`${className ? className : ''} cursor-pointer checkmark`"
        :indeterminate="indeterminate"
        v-bind="$attrs"
    />
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'

const props = defineProps<{
    indeterminate: boolean
    className?: string
}>()

const { indeterminate, className } = toRefs(props)

const inputRef = ref<any>(null)

</script>

<style lang="scss">

[type=checkbox] {
    width: 1rem;
    height: 1rem;
    color: var(--el-color-primary);
    vertical-align: middle;
    -webkit-appearance: none;
    background: none;
    border: 0;
    outline: 0;
    flex-grow: 0;
    border-radius: 3px;
    background-color: #FFFFFF;
    transition: background 120ms;
    cursor: pointer;
}

[type=checkbox]::before {
    content: "";
    color: transparent;
    display: block;
    width: inherit;
    height: inherit;
    border-radius: inherit;
    border: 0;
    background-color: transparent;
    background-size: contain;
    box-shadow: inset 0 0 0 1px #CCD3D8;
}
[type=checkbox]:checked {
    background-color: currentcolor;
}

[type=checkbox]:checked::before {
    box-shadow: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E %3Cpath d='m10 16.4l-4-4L7.4 11l2.6 2.6L16.6 7L18 8.4z' fill='%23fff'/%3E %3C/svg%3E");
}


[type=checkbox]:disabled {
    background-color: #CCD3D8;
    opacity: 0.84;
    cursor: not-allowed;
}

</style>
