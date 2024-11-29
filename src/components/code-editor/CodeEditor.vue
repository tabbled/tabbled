<template>
    <Codemirror
        class="code-editor"
        :model-value="modelValue"
        placeholder="Code goes here..."
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="4"
        :extensions="extensions"
        @update:modelValue="e => emit('update:modelValue', e)"
        @ready="handleReady"
    />
</template>

<script setup lang="ts">

import {Codemirror} from "vue-codemirror";
import {onMounted, ref, shallowRef} from "vue";
import {javascript} from "@codemirror/lang-javascript";
import {json} from "@codemirror/lang-json";
import {html} from "@codemirror/lang-html";

const view = shallowRef()
const handleReady = (payload) => {
    view.value = payload.view
}

const extensions = ref<Array<any>>([javascript()])

const props = defineProps<{
    modelValue: string,
    id?:any,
    format: 'json' | 'javascript' | 'html'
}>()

const emit = defineEmits(['update:modelValue'])

onMounted(() => {
    setExtensions()
})

function setExtensions() {
    let arr = []
    if (props.format === 'json')
        arr.push(json())
    if (props.format === 'javascript')
        arr.push(javascript())
    if (props.format === 'html')
        arr.push(html())

    extensions.value = arr
}

</script>

<style lang="scss">

.code-editor {
    .cm-editor {
        height: 100%;
        outline: 1px solid var(--el-border-color) ;
        border-radius: 4px;
    }

    .cm-focused {
        outline: 1px solid var(--el-color-primary) !important;
    }

    .cm-scroller {
        border-radius: 4px;
    }
}

</style>