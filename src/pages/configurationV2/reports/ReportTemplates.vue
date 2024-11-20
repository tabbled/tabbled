<template>


    <div class="flex flex-row h-full p-6">
        <div class="w-2/5 rounded flex flex-col">
            <div class="flex flex-row items-center gap-2 mb-6">
                <el-button size="small" >{{$t('add')}}</el-button>
                <el-input :prefix-icon="SearchIcon" size="small" :placeholder="$t('search')" class="w-full"></el-input>
            </div>
            <List :items="reports" v-model:current-index="currentIndex" @double-clicked="edit">
                <template #icon>
                    <ReportIcon :width="20" :height="20" class="mr-3 text-blue-400" />
                </template>
            </List>
        </div>



        <ReportPreview class="w-3/5 border rounded shadow-xl ml-6" :report="currentReport"/>
    </div>
</template>

<script setup lang="ts">
import List from "../../../components/list/List.vue";
import ReportIcon from "../../../components/icons/report-icon.vue"
import {ref, watch} from "vue"
import SearchIcon from "../../../components/icons/search-icon.vue";
import ReportPreview from "./ReportPreview.vue";
import {ReportDto} from "./report.dto";
import { useRouter } from "vue-router";

const router = useRouter()

let currentIndex = ref(null)
let currentReport = ref<ReportDto>(null)

watch(() => currentIndex.value, () => {
    console.log(currentIndex.value)
    currentReport.value = reports.value[currentIndex.value]
})

const edit = (idx) => {
    router.push(`/v2/configuration/reports/${reports.value[idx].alias}`)
}

const reports = ref<ReportDto[]>([{
    id: "1",
    title: "Report",
    alias: "s",
    parameters: [],
    description: "This is report 1 it renders some small content",
    templateType: 'html',
    pageSettings: {},
    datasets: []
},{
    id: null,
    alias: "report",
    title: "Report 2",
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
        type: 'datetime',
        title: "Datetime",
        alias: 'dt',
        defaultValue:  1729112520000
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
}])

</script>

<style>

</style>