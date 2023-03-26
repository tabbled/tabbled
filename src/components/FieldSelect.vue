<template>
    <el-select
        filterable
        :model-value="modelValue"
        remote
        clearable
        remote-show-suffix
        :remote-method="getData"
        :loading="isLoading"
        @change="(val) => change(val)"
    >
        <el-option
            v-for="item in data"
            :key="item.key"
            :label="item.title"
            :value="item.key"
        />
    </el-select>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {DataSetConfigInterface} from "../model/dataset";
import {useDataSourceService} from "../services/datasource.service";

let isLoading = ref(false)
let data = ref<Array<{key: string, title: string}>>([])
let dsService = useDataSourceService()

const props = defineProps<{
    dataSet?: DataSetConfigInterface,
    modelValue?: string
}>()

const emit = defineEmits(['change'])

onMounted(() => {
    getData()
})

async function getData() {
    if(!props.dataSet)
        return;

    isLoading.value = true;
    data.value = []

    let ds = dsService.getDataSourceByAlias(props.dataSet.dataSource)

    if (!ds) {
        console.warn(`No dataSource with alias "${props.dataSet.dataSource}"`)
    }

    for(const i in ds.fields) {
        const f = ds.fields[i]
        data.value.push({
            key: f.alias,
            title: `${f.title} (${f.alias})`
        })
    }

    isLoading.value = false;
}

function change(key: string) {
    let ds = dsService.getDataSourceByAlias(props.dataSet.dataSource)
    let field = ds.getFieldByAlias(key)

    emit('change', key, field)
}

</script>

<style scoped>

</style>