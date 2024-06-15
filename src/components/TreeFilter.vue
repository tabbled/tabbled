<template>
    <div v-if="fieldConfig" style="width: 100%;">
        <el-card v-if="type === 'list'"  shadow="never" body-style="padding: 0" :style="{width: '100%', height: height + 'px'}">
            <el-tree ref="tree"
                     style="width: 100%"
                     :data="treeData"
                     :model-value="selected"
                     :node-key="keyProp"
                     :props="treeProps"
                     check-strictly
                     show-checkbox
                     @check="checked"
                     :multiple="multiple"
                     lazy
                     :load="load"
            >
            </el-tree>
        </el-card>

        <el-tree-select ref="tree"
                        v-else-if="type === 'dropdown'"
                        style="width: 100%"
                        :model-value="selected"
                        :data="treeData"
                        :node-key="keyProp"
                        :props="treeProps"
                        :render-after-expand="false"
                        show-checkbox
                        check-strictly
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
import {DataSourceInterface, GetDataManyOptions} from "../model/datasource";
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
    childrenProp?: string,
    height?: string
}

const props = withDefaults(defineProps<Props>(), {
    multiple: false,
    rootItem: true,
    type: 'list',
    keyProp: 'id',
    titleProp: 'name',
    childrenProp: 'children',
})

const emit = defineEmits(['update:modelValue', 'change'])

let tree = ref(null)
let selected = ref(props.multiple ? [] : null)
let treeData = ref([])
let dataSource: DataSourceInterface = null
let dsService = useDataSourceService()


const treeProps = {
    children: props.childrenProp,
    label: props.titleProp,
    isLeaf: 'isLeaf',
}

onMounted(async () => {
    await init()
});

async function restoreState() {
    let state = localStorage.getItem(`${props.id}_state`)
    if (state) {
        selected.value = JSON.parse(state)
        tree.value.setCheckedKeys(selected.value)
    }
}

async function backupState() {
    localStorage.setItem(`${props.id}_state`, JSON.stringify(selected.value))
}

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
    } else {
        console.warn(`Field "${props.fieldConfig.alias}" is not a link type`)
    }

    await restoreState()
}

const load = async (node, resolve) => {
    if (!dataSource) {
        await init()
    }

    let opt:GetDataManyOptions = {
        fields: [props.titleProp],
        parentId: node.parent ? node.data.id : null
    }

    dataSource.getMany(opt).then(res => {
        for (let i in res.data) {
            res.data[i].isLeaf = !res.data[i].hasChildren
        }
        resolve(res.data)
        restoreState()
    })
}

function checked(val, prop) {
    if (props.multiple) {
        change(prop.checkedKeys.length ? prop.checkedKeys : null)
    } else {
        change(val.id === selected.value ? null : val.id)
    }
}


function change(value: any) {
    selected.value = value

    emit('update:modelValue', value)
    emit('change', value)

    backupState()

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