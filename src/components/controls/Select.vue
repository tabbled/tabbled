<template>
    <el-select @change="(e) => emit('change', e)" :model-value="modelValue">
        <el-option v-for="item in items"
                   :label="item.title"
                   :key="item.key"
                   :value="item.key"
        ></el-option>
    </el-select>
</template>

<script setup lang="ts">


import {onMounted, ref, watch} from "vue";
import {SelectItem} from "../../model/component";
import {usePage} from "../../store/pageStore";
import _ from "lodash"

let page = usePage()

interface Props {
    items: SelectItem[] | ((context) => Promise<SelectItem[]>)
    modelValue: string | null,
    path: string
}

const props = withDefaults(defineProps<Props>(), {
    items: null
})

watch(() => props.items,() => init())


const emit = defineEmits<{
    (e: 'change', value: any): void
}>()

let items = ref<SelectItem[]>([])

onMounted(async () => await init())



const init = async () => {
    console.log("init select", props)
    if (props.items instanceof Function) {
        items.value = await props.items({
            path: props.path,
            parentPath: page.parentPath,
            parentProps: page.parentPath ? _.get(page.properties, page.parentPath) : null,
            dataSets: page.datasets
        })
    } else {
        items.value = await props.items
    }
}

</script>

<style scoped>

</style>