<template>
    <CodeEditor v-if="type==='script'"
                :model-value="script"
                @update:model-value="onCodeUpdate"
                runnable
                style="width: 100%;"
    />
</template>

<script setup lang="ts">

import CodeEditor from "./CodeEditor.vue";

interface Props {
    type: 'script' | 'action'
    script?: string,
    action?: string
}

const props = withDefaults(defineProps<Props>(), {
    type: "script",
    script: ""
})
let emit = defineEmits(['update'])

function onCodeUpdate(code: string) {
    emit('update', {
        type: props.type ? props.type : 'script',
        script: code
    })
}

</script>

<style scoped>

</style>