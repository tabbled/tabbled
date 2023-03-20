<template>
    <el-select
                  filterable
                  :model-value="value"
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
import {onMounted, ref, UnwrapRef, watch} from "vue";
import {DataSet} from "../model/dataset";

let isLoading = ref(false)
let data = ref<Array<any>>([])


const props = defineProps<{
    field?: string,
    dataSet?: UnwrapRef<DataSet>,
    modelValue?: string | number
}>()

const emit = defineEmits(['change'])

let value = ref(getValue())

function getValue() : string | number {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    return props.dataSet.current[props.field]
}

watch(() => props.dataSet,
    async () => {
        if (props.dataSet.isOpen)
            value.value = getValue()
    },
    {
        deep: true
    })

onMounted(() => {
    getData()
})

async function getData() {

    isLoading.value = true;
    data.value = []
    let field = props.dataSet.dataSource.getFieldByAlias(props.field)

    if (!field) {
        console.error(`Field '${props.field}' not found`)
        isLoading.value = false;
        return;
    }

    if (field.type !== 'enum') {
        console.error(`Field '${props.field}' is not an enum type`)
        isLoading.value = false;
        return;
    }

    data.value = field.values
    isLoading.value = false;
}

async function change(val) {
    emit('change', val)

    value.value = val

    if (!props.dataSet || !props.field || props.field == '') {
        console.warn(`DataSet or field haven't set`)
        return;
    }

    props.dataSet.update(props.field, val)
}

</script>

<style scoped>

</style>