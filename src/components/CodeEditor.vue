<template>

<!--    <el-card shadow="never" class="editor">-->
<!--    <codemirror-->
<!--        v-model="code"-->
<!--        placeholder="Code goes here..."-->
<!--        :autofocus="true"-->
<!--        :indent-with-tab="true"-->
<!--        :tab-size="4"-->
<!--        :extensions="extensions"-->
<!--        @ready="handleReady"-->
<!--        @change="log('change', $event)"-->
<!--        @focus="log('focus', $event)"-->
<!--        @blur="log('blur', $event)"-->
<!--    />-->
<!--        <el-divider style="padding: 0; margin: 0"/>-->
<!--        <el-row justify="end">-->
<!--            <el-divider style="padding: 0; margin: 0; height: inherit" direction="vertical"/>-->
<!--            <el-button text type="primary" style="border-radius: 0">-->
<!--                <span class="iconify " data-icon="mdi:play" style="width: 18px; height: 18px; padding-right: 4px"/>-->
<!--                Run-->
<!--            </el-button>-->
<!--        </el-row>-->


<!--    </el-card>-->

</template>

<script setup lang="ts">
//import {defineComponent, ref, shallowRef} from "vue";
//import { Codemirror } from 'vue-codemirror'
//import { javascript } from '@codemirror/lang-javascript'
//import { oneDark } from '@codemirror/theme-one-dark'


// export default defineComponent({
//     components: {
//         Codemirror
//     },
//     setup() {
//         const code = ref(`console.log('Hello, world!')`)
//         const extensions = [javascript()]
//
//         // Codemirror EditorView instance ref
//         const view = shallowRef()
//         const handleReady = (payload) => {
//             view.value = payload.view
//         }
//
//         // Status is available at all times via Codemirror EditorView
//         const getCodemirrorStates = () => {
//             const state = view.value.state
//             const ranges = state.selection.ranges
//             const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
//             const cursor = ranges[0].anchor
//             const length = state.doc.length
//             const lines = state.doc.lines
//             // more state info ...
//             // return ...
//         }
//
//         return {
//             code,
//             extensions,
//             handleReady,
//             log: console.log
//         }
//     }
// });

</script>

<style lang="scss">

.editor {
    text-align: left;
    .el-card__body {
        padding: 0;
    }
    .cm-content {
        padding-bottom: 8px;
        padding-top: 8px;
    }
}

</style>