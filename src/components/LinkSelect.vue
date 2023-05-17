<template>
    <el-select v-if="!fieldConfig"
               :disabled="isDisabled"
    />
    <el-select v-else-if="fieldConfig.type === 'link' && !isTree"
               filterable
               :model-value="value"
               :disabled="isDisabled"
               remote
               clearable
               remote-show-suffix
               :remote-method="getData"
               :loading="isLoading"
               @change="(val) => change(val)"
               style="width: 100%"
    >
        <el-option
            v-for="item in data"
            :key="item[keyProp]"
            :label="item[displayProp]"
            :value="item[keyProp]"
        />
    </el-select>
    <el-tree-select v-else-if="fieldConfig.type === 'link' && isTree"
                    :model-value="value"
                    style="width: 100%"
                    :data="data"
                    :node-key="keyProp"
                    :props="treeProps"
                    show-checkbox
                    check-strictly
                    :multiple="fieldConfig.isMultiple"
                    @check="treeChanged"
    />
    <el-select v-else-if=" fieldConfig.type === 'enum'"
               filterable
               :model-value="value"
               :disabled="isDisabled"
               clearable
               @change="(val) => change(val)"
               style="width: 100%"
    >
        <el-option
            v-for="item in fieldConfig.values"
            :key="item.key"
            :label="item.title"
            :value="item.key"
        />
    </el-select>
</template>

<script setup lang="ts">
import {FieldConfigInterface} from "../model/field";
import {onMounted, ref, watch} from "vue";
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";

let isLoading = ref(false)
let data = ref<Array<object>>([])
let source: DataSourceInterface = null
let value = ref(null)
let isDisabled = ref(true)
let dsService = useDataSourceService()
let dataSource:DataSourceInterface = null
let isTree = ref(false)

interface Props {
    field: string,
    fieldConfig: FieldConfigInterface,
    modelValue?: any,
    keyProp?: string,
    displayProp?: string,
    childrenProp?: string,
    context?:any,
    title?:string,
    id?: string
}



const props = withDefaults(defineProps<Props>(), {
    keyProp: "id",
    displayProp: "name",
    childrenProp: "children"
})

const treeProps = {
    children: props.childrenProp,
    label: props.displayProp,
}

const emit = defineEmits(['update:modelValue', 'change'])

onMounted(async () => {
    await init()
    await getValue()
})

watch(() => props.modelValue,
    async () => {
        //await init()
        await getValue()
    })

watch(() => props.fieldConfig,
    async () => {
        await init()
    })

async function init() {
    isDisabled.value = true

    if (!props.fieldConfig) {
        return
    }


    if (props.fieldConfig.type == 'link') {
        dataSource = await dsService.getByAlias(props.fieldConfig.datasource)

        if (!dataSource) {
            console.warn(`Link source "${props.fieldConfig.datasource}" for field "${props.fieldConfig.alias}" not found`)
            return
        }

        isTree.value = dataSource.isTree
        await getData()
        await getValue()
    }

    isDisabled.value = false
}

async function getValue() {
    value.value = props.modelValue
}

function treeChanged(node, prop) {
    if (props.fieldConfig.isMultiple) {
        change(prop.checkedKeys)
    } else {
        change(node.id === value.value ? null : node.id)
    }
}

async function getData(query?: string) {
    isLoading.value = true;

    let opt = {
        filter: [],
        take: 50
    }
    if (query) {
        opt.filter.push({
            key: props.displayProp,
            op: 'like',
            compare: `%${query}%`
        })
    }

    data.value = await dataSource.getMany(opt)
    isLoading.value = false;
}

function change(val: string) {
    value.value = val
    emit('update:modelValue', val)
    emit('change', val)
}

</script>

<style scoped>

</style>