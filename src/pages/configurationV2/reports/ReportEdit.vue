<template>
    <div class="w-full h-full flex flex-col  items-center">
        <div class="flex w-full flex-row items-center border-b h-16" >
            <div class="flex flex-row p-4 items-center" style="width: 200px; height: 32px">
                <img style="height: 32px; width: 32px" src="/favicon.png" alt=""/>
                <div class="ml-4 text-xl text-slate-600">Tabbled</div>
            </div>
            <el-page-header @back="$router.back()" class="m-4 w-full">
                <template #content>
                    <span v-if="report.id"> {{$t('report.editTitle')}} - {{report.title}}</span>
                    <span v-else> {{$t('report.newTitle')}}</span>
                </template>

                <template #extra>
                    <el-button type="primary" size="small" @click="preview()">Preview</el-button>
                    <el-button size="small">Save</el-button>
                </template>
            </el-page-header>
        </div>

        <div class="w-full h-full  items-center" >
            <el-tabs ref="tabsEl"
                     tab-position="left"
                     class="h-full w-full pl-8 tabs-config-content"
                     v-model="currentTab"
            >
                <el-tab-pane :label="$t('report.template')" name="template" class="p-8 h-full">
                    <div v-if="!report.templateType" class="flex flex-row items-center">
                        <span class="pr-4">{{$t('report.selectType')}}:</span>
                        <el-radio-group v-model="report.templateType" size="small">
                            <el-radio-button label="HTML" value="html" />
                            <el-radio-button label="Excel" value="excel" />
                        </el-radio-group>
                    </div>
                    <RichText v-else-if="report.templateType === 'html'"
                              v-model="report.html"
                              :datasets="report.datasets"
                              class="h-full"
                    />
                </el-tab-pane>
                <el-tab-pane :label="$t('report.datasets')" name="datasets" class="p-8 h-full">
                    <DatasetsEditor v-model="report.datasets" class="w-full h-full"/>
                </el-tab-pane>
                <el-tab-pane :label="$t('report.parameters')" name="parameters" class="p-8 h-full">
                    <ParamsEditor v-model="report.parameters" class="w-full h-full"/>
                </el-tab-pane>
                <el-tab-pane :label="$t('report.postprocessing')" name="postprocessing">
                </el-tab-pane>
                <el-tab-pane :label="$t('report.settings')" name="settings">
                </el-tab-pane>
            </el-tabs>
        </div>

    </div>
</template>

<script setup lang="ts">

import {ReportDto} from "./report.dto";
import {ref} from "vue"
import {useI18n} from "vue-i18n";
import RichText from "./RichText.vue";
import {ElMessage} from "element-plus";
import {useApiClient} from "../../../services/api.service";
import ParamsEditor from "./ParamsEditor.vue";
import DatasetsEditor from "./DatasetsEditor.vue";
import {preview as previewReport} from "./utils";

let api = useApiClient()
const { t } = useI18n();
const currentTab = ref('template')

const report = ref<ReportDto>({
    id: null,
    alias: "report",
    title: t('report.newTitle'),
    description: "",
    parameters: [{
        type: 'date',
        title: "Date begin",
        alias: 'dateBegin',
        defaultValue: "20240801"
    },{
        type: 'date',
        title: "Date end",
        alias: 'dateEnd',
        defaultValue: "20241001"
    },{
        type: 'enum',
        title: "Status",
        isMultiple: true,
        alias: 'status'
    }],
    html: "<table dataset=\"dataset1\" style=\"width: 511px\"><colgroup><col style=\"width: 85px\"><col style=\"width: 282px\"><col style=\"width: 77px\"><col style=\"width: 67px\"></colgroup><tbody><tr><th colspan=\"1\" rowspan=\"1\" colwidth=\"85\"><p>Заказ</p></th><th colspan=\"1\" rowspan=\"1\" colwidth=\"282\"><p>Операция</p></th><th colspan=\"1\" rowspan=\"1\" colwidth=\"77\"><p>Цена</p></th><th colspan=\"1\" rowspan=\"1\" colwidth=\"67\"><p>Кол-во</p></th></tr><tr><td colspan=\"1\" rowspan=\"1\" colwidth=\"85\"><p>{{order.number}}</p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"282\"><p>{{operation.name}}</p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"77\"><p>{{operation.price}}</p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"67\"><p>{{qty}}</p></td></tr></tbody></table><p>{{dataset1.totalCount}}</p>",
    xlsx: "",
    datasets: [{
        alias: "dataset1",
        datasource: "order_operations_3",
        filterBy: "order.moment >= {{params.dateBegin}} AND order.moment <= {{params.dateEnd}}",
        fields: ['order', 'operation', 'product.name', 'qty']
    }],
    pageSettings: {
        layout: "portrait",
        size: 'A4',
        margin: "default"
    },
    templateType: 'html'
})

const preview = async () => {
    console.log('Preview Report')

    let params = {}
    report.value.parameters.forEach(p => {
        params[p.alias] = p.defaultValue
    })

    try {
        await previewReport(report.value, params)
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}



</script>

<style lang="scss">

</style>