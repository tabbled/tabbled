<template>
    <div v-if="!field">No field</div>
    <el-select v-else-if="!field.linkedDatasource.isTree && (!item.widget || item.widget === 'select')"
               style="width: 100%"
               :model-value="value"
               @change="onChange"
               :multiple="item.operation === 'in' || item.operation === '!in'"
               clearable
               remote
               filterable
               :remote-method="getData"
    >
        <el-option
            v-for="item in linkData"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        />
    </el-select>
    <el-tree-select v-else-if="field.linkedDatasource.isTree && (!item.widget || item.widget === 'select')"
                    style="width: 50%"
                    :load="loadTreeNode"
                    v-model="selectedNodes"
                    :node-key="'id'"
                    :props="treeProps"
                    show-checkbox
                    check-strictly
                    :multiple="item.operation === 'in' || item.operation === '!in'"
                    @check="onChangeTree"
                    default-expand-all
                    lazy
    />
</template>

<script setup lang="ts">
import {FilterPanelItemInterface} from "./index";
import {FieldInterface} from "../../model/field";
import {onMounted, ref, watch} from "vue";
import {useApiClient} from "../../services/api.service";
import {GetDataManyResponseDto} from "../dataset";
import type Node from 'element-plus/es/components/tree/src/model/node'


const api = useApiClient()
const isTree = ref(false)

interface Props {
    item: FilterPanelItemInterface
    value: any
    field: FieldInterface
}

let selectedNodes = ref()

const linkData = ref([])
const props = withDefaults(defineProps<Props>(), {
    value: () => null
})
const treeProps = ref({
    children: "children",
    label: "label",
    isLeaf: "isLeaf",
})

const emit = defineEmits<{
    (e: 'change', value): void
}>()

onMounted(() => {
    if (!props.field.linkedDatasource.isTree) {
        getData()
    } else {
        selectedNodes.value = props.value
    }

})

watch(() => props.field, () => {
    getData()
})

watch(() => props.item.operation, () => {
    selectedNodes.value = null
})

const onChange = (e) => {
    console.log(e, props.item)
    emit('change', e)
}

const onChangeTree = (val, prop) => {
    onChange(prop.checkedKeys.length ? prop.checkedKeys : null)
}


const getData = async (search?: string) => {
    let params = {
        query: search,
        limit: 100,
        sort: ["name:asc"]
    }
    let res = (await api.post(`/v2/datasource/${props.field.datasourceReference}/data`, params)).data as GetDataManyResponseDto

    isTree.value = !!res.isTree
    linkData.value = res.items
}

const loadTreeNode = async (node: Node, resolve: (data: any[]) => void, reject: () => void) => {
    let params = {
        limit: 100,
        fields: ["id", "name", "has_children"],
        sort: ["name:asc"],
        parentId: node && node.data.id ? node.data.id : null
    }
    try {
        let res = (await api.post(`/v2/datasource/${props.field.datasourceReference}/data`, params)).data as GetDataManyResponseDto
        resolve(res.items.map(i => {
            return {
                id: i.id,
                label: i.name,
                isLeaf: !i.has_children,
                children: []
            }
        }))
        selectedNodes.value = props.value
    }
    catch (e) {
        console.error(e)
        reject()
    }
}


</script>

<style lang="scss">
.filter-panel-select-item {
    min-width: 150px;
}
</style>