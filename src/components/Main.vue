<template>
    sdsd
    <CodeEditor>
    </CodeEditor>

</template>

<script>
import {defineComponent} from "vue";
import CodeEditor from "./CodeEditor.vue"



export default defineComponent({
    components: {
        CodeEditor
    },
    data() {
        return {
            query: "function ii() { return 1; } "
        }
    },
    methods: {

    }
});

</script>

<style lang="scss">

.editor {
    .el-card__body {
        padding: 0;
    }
    .cm-content {
        padding: 0;
    }
}

</style>