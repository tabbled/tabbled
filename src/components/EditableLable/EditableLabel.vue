<template>
    <input v-if="editing"
           class="focus:outline-none focus:ring-blue-400 ring-1 ring-transparent ring-inset hover:ring-gray-100"
           style="width: 100%"
           type="text"
           :value="modelValue"
           ref="editInput"
           @focusout="editing = true"
           @change="onChange"
           @input="onInput"
           :placeholder="placeholder"/>
    <div v-else @click="toggleEdit()">
        {{modelValue ? modelValue : placeholder}}
    </div>

</template>

<script lang="ts" setup>

import {nextTick, ref} from "vue"

const editing = ref(false)
const props = defineProps<{
    modelValue: string,
    placeholder?: string
}>()
const editInput = ref()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void,
    (e: 'input', value: string): void,
    (e: 'change', value: string): void
}>()

const toggleEdit = () => {
    editing.value = !editing.value
    nextTick(() => editInput.value.focus());
}

const onChange = (e) => {
    emit('update:modelValue', e.target.value);
    emit('change', e.target.value)
}

const onInput = (e) => {
    emit('input', e.target.value)
}

</script>

<style scoped>

</style>