<template>


    <div class="flex flex-row h-full p-6">
        <div class="w-2/5 rounded flex flex-col">
            <div class="flex flex-row items-center gap-2 mb-6">
                <el-button size="small" @click="add()">{{$t('add')}}</el-button>
                <el-input :prefix-icon="SearchIcon" size="small" :placeholder="$t('search')" class="w-full"></el-input>
            </div>
            <List :items="reports" v-model:current-index="currentIndex">
                <template #icon>
                    <ReportIcon :width="20" :height="20" class="flex-none mr-3 text-blue-400" />
                </template>
            </List>
        </div>



        <ReportPreview class="w-3/5 border rounded shadow-xl ml-6" :report="currentReport"/>
    </div>
</template>

<script setup lang="ts">
import List from "../../../components/list/List.vue";
import ReportIcon from "../../../components/icons/report-icon.vue"
import {onMounted, ref, watch} from "vue"
import SearchIcon from "../../../components/icons/search-icon.vue";
import ReportPreview from "./ReportPreview.vue";
import {ReportDto} from "./report.dto";
import { useRouter } from "vue-router";
import {useApiClient} from "../../../services/api.service";
import {ElMessage} from "element-plus";

const router = useRouter()
const api = useApiClient()

let currentIndex = ref(null)
let currentReport = ref<ReportDto>(null)

watch(() => currentIndex.value, async () => {
    await loadParams(reports.value[currentIndex.value].id)
})

onMounted(() => {
    load()
})

const loadParams = async (id: number) => {
    let res = await api.get(`/v2/reports/${id}/params`)

    if (res.status !== 200) {
        ElMessage.error('Ooops, something went wrong!')
        return
    }
    currentReport.value = res.data.report
}

const add = () => {
    router.push(`/v2/configuration/reports/new`)
}

// const edit = (idx) => {
//     console.log(reports.value)
//     //currentReport.value = reports.value[idx]
// }

const load = async (search?: string) => {
    let res = await api.get(`/v2/reports`)

    if (res.status !== 200) {
        ElMessage.error('Ooops, something went wrong!')
        return
    }

    reports.value = res.data.items
}

const reports = ref<ReportDto[]>([])

</script>

<style>

</style>