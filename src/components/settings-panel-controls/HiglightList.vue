<template>
    <List key-prop="alias"
          title-prop="title"
          @insert="add"
          @remove="remove"
          :label="label"
          :items="items"
          :sortable="true"
          @edit="edit"
    >
        <template #actions>
            <el-button style="font-size: 16px;" size="small" text circle @click="add">
                <PlusIcon/>
            </el-button>
        </template>
        <template #default={item}>
            {{item.title}}
        </template>
    </List>
</template>

<script setup lang="ts">
import List from "./List.vue";
import PlusIcon from "../icons/plus-icon.vue";
import {onMounted} from "vue";
import _ from "lodash"
import {usePage} from "../../store/pageStore";

let pageStore = usePage()

interface Props {
    items?: any[]
    label?: string,
    path: string,
    parentPath: string
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    label: "Highlight row"
})
const emit = defineEmits(['change'])

onMounted(() => {

})

const add = () => {
    let arr  = props.items ? _.cloneDeep(props.items) : []

    const max = _.maxBy(arr, (i) => Number(i.id))
    const id = (max ? Number(max.id) + 1 : 1).toString()
    arr.push({
        id: id,
        expression: "",
        title: `Highlight ${id}`,
        color: "red"
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

const edit = (idx) => {
    try {
        pageStore.openSettings(`${props.path}[${idx}]`, 'HighlightRow', props.parentPath)
    } catch (e) {
        console.error(e)
    }
}

</script>

<style scoped>

</style>