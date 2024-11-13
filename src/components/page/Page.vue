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

                                <el-dropdown-item v-for="rep in reportMenu" @click="generateReport(rep.alias)">
                                    {{rep.title}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <el-button v-if="page.editMode" size="small" type="primary" @click="save()">{{$t('save')}}</el-button>

                    <el-button v-if="page.editMode" type="info" text circle @click="emit('settingsRequest')"
                               style="padding: 0 !important; height: 30px; width: 30px">
                        <SettingsIcon/>
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

const store = useStore();
const {t} = useI18n()
let api = useApiClient()

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

const generateReport = async (alias) => {
    console.log('generateReport',alias)

    try {
        let res = await api.post(`v2/reports/${alias}/render`, {
            context: getContext()
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
</style>