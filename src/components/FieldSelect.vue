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
import {useDataSourceService} from "../services/datasource.service";
import {DataSourceInterface} from "../model/datasource";

let isLoading = ref(false)
let data = ref<Array<{key: string, title: string}>>([])
let dsService = useDataSourceService()
let dataSource:DataSourceInterface = null

const props = defineProps<{
    dataSource?: string,
    modelValue?: string
}>()

const emit = defineEmits(['change'])

onMounted(async () => {
    await init();
    await getData()

})

function init() {
    if(!props.dataSource)
        return;

    dataSource = dsService.getDataSourceByAlias(props.dataSource)
    if (!dataSource) {
        console.warn(`No dataSource with alias "${props.dataSource}"`)
    }
}

async function getData() {
    isLoading.value = true;
    data.value = []



    for(const i in dataSource.fields) {
        const f = dataSource.fields[i]
        data.value.push({
            key: f.alias,
            title: `${f.title} (${f.alias})`
        })
    }

    isLoading.value = false;
}

function change(key: string) {
    let ds = dsService.getDataSourceByAlias(props.dataSource)
    let field = ds.getFieldByAlias(key)

    emit('change', key, field)
}

</script>

<style scoped>

</style>