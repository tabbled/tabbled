<template>
    <List key-prop="alias"
          title-prop="alias"
          @insert="add"
          @remove="remove"
          :label="label"
          :items="items"
          :sortable="false"
          @edit="edit"
    >
        <template #actions>
            <el-dropdown ref="dropdown" max-height="400">
                <el-button style="font-size: 16px;" size="small" text circle @click="openMenu">
                    <PlusIcon/>
                </el-button>

                <template #dropdown>
                    <el-dropdown-item v-for="item in datasources"
                                      @click="add(item)">
                        {{item.title}} ({{item.key}})
                    </el-dropdown-item>
                </template>
            </el-dropdown>
        </template>
        <template #default={item}>
            {{item.alias}}
        </template>
    </List>
</template>

<script setup lang="ts">
import List from "./List.vue";
import PlusIcon from "../icons/plus-icon.vue";
import {onMounted, ref} from "vue";
import _ from "lodash"
import {DatasourceApi} from "../../api/datasource.api";
import {useApiClient} from "../../services/api.service";
import {usePage} from "../../store/pageStore";

let api = useApiClient()
let dsApi = new DatasourceApi(api)
let pageStore = usePage()

let dropdown = ref(null)
let datasources = ref([{
    key: "ds",
    title: "Title"
}])

interface Props {
    items?: any[]
    label?: string
    path: string
    parentPath: string
}

const props = withDefaults(defineProps<Props>(), {
    list: () => [],
    label: "Data sets"
})
const emit = defineEmits(['change'])

onMounted(() => {
})

const add = (e) => {
    let arr  = props.items ? _.cloneDeep(props.items) : []
    arr.push({
        alias: e.key,
        datasource: e.key
    })
    emit('change', arr)
}

const remove = (idx) => {
    if (!props.items)
        return

    let arr  = _.cloneDeep(props.items)
    arr.splice(idx, 1)
    emit('change', arr)
}

const getDatasource = async () => {
    let res = await dsApi.getMany()
    datasources.value = res.map(i => {
        return {
            key: i.alias,
            title: i.title
        }
    })
}

const edit = async (idx) => {
    try {
        //pageStore.openSettings(`${props.path}[${idx}]`, 'Dataset', props.parentPath)
    } catch (e) {
        console.error(e)
    }
}

const openMenu = async () => {
    await getDatasource()
    dropdown.value.handleOpen()
}

</script>

<style scoped>

</style>