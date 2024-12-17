<template>


    <div class="flex flex-row h-full w-full p-6">
        <div class="w-5/12 rounded flex flex-col">
            <div class="flex flex-row items-center gap-2 mb-6">
                <el-button size="small" @click="add()">{{$t('add')}}</el-button>
                <el-input :prefix-icon="SearchIcon" size="small"
                          :placeholder="$t('search')"
                          class="w-full"
                          @input="debouncedSearch()"
                          v-model="searchText"/>
            </div>
            <List :items="reports" v-model:current-index="currentIndex">
                <template #icon>
                    <ReportIcon :width="20" :height="20" class="flex-none mr-3 text-blue-400" />
                </template>
                <template #extra="{item}">
                    <el-dropdown placement="bottom-end" trigger="click">
                    <el-button text circle v-if="permissions && permissions.admin">
                        <more-vert-icon/>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item :icon="EditIcon" @click="edit(item.id)">{{$t('edit')}}</el-dropdown-item>
                            <el-dropdown-item :icon="DuplicateIcon" @click="duplicate(item.id)">{{$t('duplicate')}}</el-dropdown-item>
                            <el-dropdown-item :icon="DeleteIcon" @click="remove(item.id)">{{$t('delete')}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                    </el-dropdown>

                </template>
            </List>
        </div>



        <ReportPreview class="w-7/12 border rounded shadow-xl ml-6" :report="currentReport" :can-edit="permissions ? permissions.admin : false"/>
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
import {ElMessage, ElMessageBox} from "element-plus";
import {useStore} from "vuex";
import MoreVertIcon from "../../../components/icons/more-vert-icon.vue";
import DeleteIcon from "../../../components/icons/delete-icon.vue";
import DuplicateIcon from "../../../components/icons/duplicate-icon.vue";
import {useI18n} from "vue-i18n";
import {useDebounceFn} from "@vueuse/core";
import EditIcon from "../../../components/icons/edit-icon.vue";

const router = useRouter()
const api = useApiClient()
const store = useStore();
const {t} = useI18n()

let currentIndex = ref(null)
let currentReport = ref<ReportDto>(null)
const permissions = ref()
let searchText = ref("")


watch(() => currentIndex.value, async () => {
    await loadParams(reports.value[currentIndex.value].id)
})

onMounted(() => {
    permissions.value = store.getters['auth/account'].permissions
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

const edit = (id) => {
    router.push(`/v2/configuration/reports/${id}`)
}

const duplicate = async (id) => {
    try {
        await api.post(`/v2/reports/${id}/duplicate`, {})
        await load()
    } catch (e) {
        console.error(e)
        ElMessage.error(e.toString())
    }
}

const remove = (id) => {
    ElMessageBox.confirm(
        t('confirmDeleteTitle'),
        t('delete'),
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    )
        .then(async () => {
            try {
                await api.delete(`/v2/reports/${id}`)
                await load()
            } catch (e) {
                console.error(e)
                ElMessage.error(e.toString())
            }
        })
        .catch(() => {})
}

const debouncedSearch = useDebounceFn(() => {
    load(searchText.value)
}, 500, {maxWait: 500})

const load = async (search?: string) => {
    try {
        let res = await api.get(`/v2/reports?search=${search ? search : ''}`)
        console.log(search)

        if (res.status !== 200) {
            ElMessage.error('Ooops, something went wrong!')
            return
        }

        reports.value = res.data.items
    } catch (e) {
        ElMessage.error(e.toString())
    }
}

const reports = ref<ReportDto[]>([])

</script>

<style>

</style>