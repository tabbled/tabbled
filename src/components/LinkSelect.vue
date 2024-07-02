<template>
    <div style="display: flex; flex-direction: row; width: 100%; padding-top: 1px">
        <el-select v-if="!fieldConfig"
                   disabled
        />
        <el-select v-else-if="fieldConfig.type === 'link' && !isTree"
                   filterable
                   :model-value="value"
                   :disabled="disabled || isDisabled"
                   remote
                   readonly
                   :clearable="clearable"
                   remote-show-suffix
                   :remote-method="getData"
                   :loading="isLoading"
                   @change="(val) => change(val)"
                   :multiple="fieldConfig.isMultiple"
                   style="width: 100%;"
                   ref="select"
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
                        :disabled="disabled || isDisabled"
                        style="width: 100%"
                        :node-key="keyProp"
                        :props="treeProps"
                        show-checkbox
                        :clearable="clearable"
                        check-strictly
                        :multiple="fieldConfig.isMultiple"
                        @check="treeChanged"
                        lazy
                        :load="load"
                        :cache-data="data"
                        @clear="treeClear"
        />
        <el-select v-else-if=" fieldConfig.type === 'enum'"
                   filterable
                   :model-value="value"
                   :disabled="disabled || isDisabled"
                   :clearable="clearable"
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

        <el-button v-if="fieldConfig && fieldConfig.type === 'link' && fieldConfig.config.searchDialog && !(disabled || isDisabled)"
                   text
                   @click="searchDialogVisible = true"
                   style="width: 32px; opacity:0.5; margin-left: 4px"
        >
            <Icon icon="mdi:magnify" width="24"/>
        </el-button>
    </div>
    <DialogView v-if="fieldConfig && fieldConfig.config && fieldConfig.config.searchDialog"
                :screen-size="screenSize"
                v-model:visible="searchDialogVisible"
                :options="{modal: true, page: fieldConfig && fieldConfig.config.searchDialog, selecting: true}"
                @selected="selectFromDialog"
    />
</template>

<script setup lang="ts">
import {FieldInterface} from "../model/field";
import {onMounted, ref, watch} from "vue";
import {DataSourceInterface, GetDataManyOptions} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
import DialogView from "./DialogView.vue";
import {ScreenSize} from "../model/page";

let isLoading = ref(false)
let data = ref<Array<any>>([])
let source: DataSourceInterface = null
let value = ref(null)
let isDisabled = ref(true)
let dsService = useDataSourceService()
let dataSource:DataSourceInterface = null
let isTree = ref(false)
let searchDialogVisible = ref(false)
let select = ref(null)


interface Props {
    field: string,
    fieldConfig: FieldInterface,
    modelValue?: any,
    keyProp?: string,
    displayProp?: string,
    childrenProp?: string,
    context?:any,
    title?:string,
    id?: string,
    screenSize?: ScreenSize,
    disabled?: boolean,
    clearable?: boolean
}



const props = withDefaults(defineProps<Props>(), {
    keyProp: "id",
    displayProp: "name",
    childrenProp: "children",
    clearable: true
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

    isDisabled.value = false

    if (props.fieldConfig.type == 'link') {
        dataSource = await dsService.getByAlias(props.fieldConfig.datasource)

        if (!dataSource) {
            console.warn(`Link source "${props.fieldConfig.datasource}" for field "${props.fieldConfig.alias}" not found`)
            return
        }

        await getValue()

        isTree.value = dataSource.isTree
        if (isTree.value) {
            await getCacheData()
        } else {
            await getData()
        }
    }

}

async function getValue() {
    value.value = props.modelValue
}

function itemExists(id) : boolean {
    for(let i in data.value) {
        if (data.value[i].id === id)
            return true
    }
    return false
}

function treeClear() {
    change(null)
}

function treeChanged(node, prop) {
    console.log(node, prop)
    if (props.fieldConfig.isMultiple) {
        change(prop.checkedKeys)
    } else {
        change(node.id === value.value ? null : node.id)
    }
}

const getRouteToNode = (node) => {
    if (!node.parent) {
        return [];
    }

    return [
        ...getRouteToNode(node.parent),
        node.data.id,
    ];
}

async function load(node, resolve) {
    let opt = {
        take: 50,
        include: null,
        route: getRouteToNode(node),
        fields: [props.displayProp],
        parentId: node.parent ? node.data.id : null,
    }

    if (value.value) {
        opt.include = props.fieldConfig.isMultiple ? value.value : [value.value]
    }

    let data = await dataSource.getMany(opt)
    resolve(data.data)
}

async function getData(query?: string) {

    isLoading.value = true;

    let opt = {
        take: 50,
        include: null
    }

    if (value.value) {
        opt.include = props.fieldConfig.isMultiple ? value.value : [value.value]
    }

    if (query) {
        opt['search'] = query
    }

    data.value = (await dataSource.getMany(opt)).data
    isLoading.value = false;
}

async function change(val: string[]) {
    value.value = val && val.length ? val[0] : null

    emit('update:modelValue', val)
    emit('change', val)
}

const selectFromDialog = async (val: string[]) => {
    value.value = val.length ? val[0] : null
    await getData()

    emit('update:modelValue', value.value)
    emit('change', value.value)
}

const getCacheData = async () => {
    console.log('getCacheData')
    if (!dataSource)
        return

    let opt:GetDataManyOptions = {
        filter: [],
        take: 20,
        fields: [props.displayProp],
        id: value.value ?  (props.fieldConfig.isMultiple ? value.value : [value.value]) : null
    }

    console.log('getCacheData', opt)

    data.value = (await dataSource.getMany(opt)).data
    return data.value
}



</script>

<style scoped>

</style>