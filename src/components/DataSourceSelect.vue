<template>
    <el-select
                  filterable
                  :model-value="modelValue"
                  remote
                  clearable
                  remote-show-suffix
                  :remote-method="getData"
                  :loading="isLoading"
                  @change="(val) => emit('change', val)"
    >
        <el-option-group
            v-for="group in dataGroups"
            :key="group.key"
            :label="group.label"
        >
            <el-option
                v-for="item in data[group.key]"
                :key="item.alias"
                :label="item.alias"
                :value="item.alias"
            />
        </el-option-group>
    </el-select>
</template>

<script setup lang="ts">
import {useDataSourceService} from "../services/datasource.service";
import {DataSourceInterface} from "../model/datasource"
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref} from "vue";

let dsService = useDataSourceService()
let isLoading = ref(false)
let data = ref<{config: DataSourceInterface[], user: DataSourceInterface[]}>({
    config: [],
    user: []
})

let dataGroups = ref([{
    key: 'user',
    label: "User's"
},{
    key: 'config',
    label: "Config"
}])


const props = defineProps<{
    config: FieldConfigInterface,
    modelValue: string | number
}>()
const emit = defineEmits(['change'])

onMounted(() => {
    console.log(props)
    getData()
})

function getData(query?: string) {
    console.log(query)

    //let source = dsService.getDataSourceByAlias(props.config.link)

    isLoading.value = true;
    data.value = {
        config: dsService.getConfigDataSources(),
        user: dsService.getDataSources()
    }
    console.log(data)

    isLoading.value = false;
}

</script>

<style scoped>

</style>