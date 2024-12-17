<template>
    <div class="divide-y flex flex-col" >
        <el-page-header ref="mainHeader" class="p-4" @back="$router.back()">
            <template #content>
                <div class="flex flex-row">
                    <span>{{title}}</span>
                </div>
            </template>
            <template #extra>
                <div class="flex flex-row items-center gap-2 min-h-9">

                    <el-dropdown v-if="reportMenu.length"
                    >
                        <el-button size="small" >

                            {{$t('print')}}
                            <DropdownArrowIcon style="margin-left: 4px"/>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>

                                <el-dropdown-item v-for="rep in reportMenu" @click="openReport(rep.id)">
                                    {{rep.title}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <el-button v-if="page.editMode" size="small" type="primary" @click="save()">{{$t('save')}}</el-button>

                    <el-button v-if="page.editMode" type="info" text circle @click="emit('settingsRequest')"
                               style="padding: 0 !important; height: 30px; width: 30px">
                        <SettingsIcon :height="16" :width="16"/>
                    </el-button>
                    <el-dropdown v-if="advancedMenu.length">
                        <el-button text circle>
                            <MoreVertIcon/>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="item in advancedMenu" @click="item.action()">
                                    {{item.title}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>


                </div>
            </template>
        </el-page-header>
        <Grid class="h-full overflow-auto p-5" path="" :elements="elements"/>

        <el-dialog v-model="reportParamsDialogVisible" :show-close="false" class="p-0 report-params" >
            <template #header="{close}"></template>
            <ReportPreview :report="reportParams" :can-edit="canEdit"/>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import Grid from "../Grid.vue";
import SettingsIcon from "../icons/settings-icon.vue";
import {usePage} from "../../store/pageStore";
import {ElMessage} from "element-plus";
import {useStore} from "vuex";
import {onMounted, ref} from "vue";
import {useApiClient} from "../../services/api.service";
import {b64toBlob} from "../../utils/base64ArrayBuffer.js";
import {useI18n} from "vue-i18n";
import MoreVertIcon from "../icons/more-vert-icon.vue";
import DropdownArrowIcon from "../icons/dropdown-arrow-icon.vue";
import ReportPreview from "../../pages/configurationV2/reports/ReportPreview.vue";

const store = useStore();
const {t} = useI18n()
let api = useApiClient()
const reportParamsDialogVisible = ref(false)
const reportParams = ref()

interface Props {
    title: string
    elements: any[]
}

const page = usePage()
let canEdit = ref<boolean>(false)
let reportMenu = ref([])

const props = defineProps<Props>()

class AdvancedMenuItem {
    title: string
    action: () => void
}

const advancedMenu = ref<AdvancedMenuItem[]>([])

const emit = defineEmits<{
    (e: 'settingsRequest'): void
}>()

onMounted(() => {
    let permissions = store.getters['auth/account'].permissions
    canEdit.value = permissions.admin

    if (canEdit.value) {
        advancedMenu.value.push({
            title: t('edit'),
            action: () => {
                page.editMode = true
            }
        })
    }
    getReports()
})

const save = async () => {
    page.closeSetting()
    try {
        if (await page.saveChanges()) {
            ElMessage.success({
                message: t('messages.pageSaved'),
                duration: 1000
            })
        }
    } catch (e) {
        ElMessage.error(e.toString())
    }
}

const getReportParams = async(id) => {
    try {
        let res = await api.get(`v2/reports/${id}/params`)
        return res.data.report
    } catch (e) {
        ElMessage.error(e)
    }
}

const openReport = async(id) => {
    const report = await getReportParams(id)
    console.log(report)
    if (report.parameters && report.parameters.length !== 0) {
        reportParams.value = report
        reportParamsDialogVisible.value = true
    } else
        await generateReport(id)

}

const generateReport = async (id, params?) => {
    console.log('generateReport',id)

    try {
        let res = await api.post(`v2/reports/${id}/render`, {
            context: getContext(),
            params: params ? params : undefined
        })
        let rep = res.data

        const objectUrl = window.URL.createObjectURL(new Blob([b64toBlob(rep.report)], {type: `${rep.contentType}`}));

        if (rep.contentType === 'application/pdf') {
            window.open(objectUrl)
        } else {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute('style',"display: none")
            a.href = objectUrl
            a.download = rep.filename
            a.click()
            URL.revokeObjectURL(objectUrl)
        }
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

const getReports = async () => {
    let res = await api.get(`v2/reports?page=${page.properties.alias}`)

    console.log(res.data.items)
    reportMenu.value = res.data.items
}

const getContext = () => {
    let ctx = {
        page: {
            id: page.properties.id,
            alias: page.properties.alias,
            title: page.properties.title,
            datasets: []
        },
    }
    for(let i in page.properties.datasets) {
        let cfg = page.properties.datasets[i]
        let ds = page.datasets[cfg.alias]

        console.log(ds)
        ctx.page.datasets.push({
            alias: cfg.alias,
            datasource: cfg.datasource,
            fields: cfg.fields,
            search: ds.search,
            filterBy: ds.filterBy,
            selected: ds.selected,
            selectedAll: ds.selectedAll,
            sort: ds.sort
        })
    }

    return ctx
}

</script>

<style lang="scss">

.page-header-content {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.list-page-view {
    display: flex;
    flex-direction: column;
}

.list-page-view-header {
    padding: 16px;
}

.report-params {
    .el-dialog__header {
        display: none !important;
    }
}
</style>