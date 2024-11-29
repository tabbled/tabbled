<template>
    <CodeEditor  v-model="report.script"  format="javascript" class="w-full border-2"/>
</template>

<script lang="ts" setup>
import CodeEditor from "../../../components/code-editor/CodeEditor.vue";
import {ReportDto} from "./report.dto";

const props = defineProps<{
    report: ReportDto,
    id?:any,
}>()

</script>

<style scoped>

</style>