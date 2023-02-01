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
        <el-option
            v-for="item in data"
            :key="item[config.keyProp]"
            :label="item[config.displayProp]"
            :value="item[config.keyProp]"
        />
    </el-select>
</template>

<script setup lang="ts">
import {useDataSourceService} from "../services/datasource.service";
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref} from "vue";

let dsService = useDataSourceService()
let isLoading = ref(false)
let data = ref<Array<object>>([])


const props = defineProps<{
    config: FieldConfigInterface,
    modelValue: string | number
}>()
const emit = defineEmits(['change'])

onMounted(() => {
    console.log(props)
    getData()
})

async function getData(query?: string) {
    console.log(query)

    let source = dsService.getDataSourceByAlias(props.config.link)
    if (!source) {
        console.warn(`DataSource "${props.config.link}" is not found`)
        return []
    }

    isLoading.value = true;
    data.value = await source.getAll()
    console.log(data)

    isLoading.value = false;
}

</script>

<style scoped>

</style>