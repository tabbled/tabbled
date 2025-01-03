<template>
    <div class="w-full h-full relative flex flex-col gap-3">
        <div class="flex flex-row">
            <el-button size="small" @click="runCode">Run</el-button>
        </div>

        <CodeEditor  v-model="report.postprocessing"  format="javascript" class="w-full h-20 border-2"/>
    </div>

</template>

<script lang="ts" setup>
import CodeEditor from "../../../components/code-editor/CodeEditor.vue";
import {ReportDto} from "./report.dto";
import {useApiClient} from "../../../services/api.service";
import {ElMessage} from "element-plus";

let api = useApiClient()

const props = defineProps<{
    report: ReportDto,
    id?:any
}>()

const runCode = async () => {
    console.log(props.report.postprocessing)

    let params = {}
    props.report.parameters.forEach(p => {
        params[p.alias] = p.defaultValue
    })

    try {
        let res = await api.post('v2/reports/postprocess', {report: props.report, params: params})
        if (res.status !== 200) {
            console.error(res)
            ElMessage.error(res.data)
            return
        }
        ElMessage.success('Success! Result of function see in console')
        console.log(res.data.data)
    } catch (e) {
        console.error(e)
        ElMessage.error(e.response.data.error)
    }

}

</script>

<style scoped>

</style>