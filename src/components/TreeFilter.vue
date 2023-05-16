<template>
    <div v-if="fieldConfig" style="width: 100%;">
        <el-card v-if="type === 'list'"  shadow="never" body-style="padding: 0" style="width: 100%">
            <el-tree ref="tree"
                     style="width: 100%"
                     :data="treeData"
                     :node-key="keyProp"
                     :props="treeProps"
                     default-expand-all
                     check-on-click-node
                     show-checkbox
                     @check="checked"
                     :multiple="multiple"
            >
            </el-tree>
        </el-card>

        <el-tree-select ref="tree"
                        v-else-if="type === 'dropdown'"
                        style="width: 100%"
                        v-model="selected"
                        :data="treeData"
                        :node-key="keyProp"
                        :props="treeProps"
                        :render-after-expand="false"
                        check-on-click-node
                        show-checkbox
                        @check="checked"
                        :multiple="multiple"
        />
    </div>

    <div v-else style="width: 100%">
        <el-tree v-if="type === 'list'" style="width: 100%"/>
        <el-tree-select v-else-if="type === 'dropdown'" style="width: 100%"/>
    </div>


</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {FieldConfigInterface} from "../model/field";
import {Filters} from "../model/filter";
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";

interface Props {
    id: string
    modelValue?: any,
    field?: string,
    fieldConfig: FieldConfigInterface,
    multiple?: boolean,
    filters?: Filters,
    type: 'list' | 'dropdown'
    rootItem: boolean,
    keyProp?: string,
    titleProp?: string,
    childrenProp?: string
}

const props = withDefaults(defineProps<Props>(), {
    multiple: false,
    rootItem: true,
    type: 'list',
    keyProp: 'id',
    titleProp: 'name',
    childrenProp: 'items',
})

const emit = defineEmits(['update:modelValue', 'change'])

let tree = ref(null)
let selected = ref(props.multiple ? [] : null)
let isLoading = ref(false)
let treeData = ref([])
let dataSource: DataSourceInterface = null
let dsService = useDataSourceService()


const treeProps = {
    children: props.childrenProp,
    label: props.titleProp,
}

onMounted(async () => {
    await init()
});

async function init() {
    if (!props.fieldConfig) {
        return
    }

    if (props.fieldConfig.type == 'link') {
        dataSource = await dsService.getByAlias(props.fieldConfig.datasource)

        if (!dataSource) {
            console.warn(`Link source "${props.fieldConfig.datasource}" for field "${props.fieldConfig.alias}" not found`)
            return
        }
        await getData()
    } else {
        console.warn(`Field "${props.fieldConfig.alias}" is not a link type`)
    }
}

async function getData() {
    if (!props.fieldConfig) {
        return
    }

    isLoading.value = true;

    let opt = {
        filter: [],
        take: 200
    }


    treeData.value = await dataSource.getMany(opt)
    isLoading.value = false;
}

function checked(val, prop) {
    console.log(prop.checkedKeys)
    //tree.getCheckedKeys

    if (!prop.checkedKeys.length) {
        change(null)
        return
    }

    change(props.multiple ? prop.checkedKeys : prop.checkedKeys[0])
}


function change(value: any) {
    emit('update:modelValue', value)
    emit('change', value)

    if (!props.filters) {
        console.warn('No filters')
        return
    }

    if (value === null || (props.multiple && !value.length)) {
        props.filters.setFilter(props.id, null)
        return
    }


    props.filters.setFilter(props.id, {
        key: props.fieldConfig.alias,
        op: props.multiple ? 'in' : '==',
        compare: value
    })
}

</script>

<style lang="scss">

</style>