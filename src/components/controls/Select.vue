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


import {onMounted, ref} from "vue";
import {SelectItem} from "../../model/component";

export interface Props {
    items: SelectItem[] | (() => Promise<SelectItem[]>)
    modelValue: string | null
}

const props = withDefaults(defineProps<Props>(), {
    items: null
})

const emit = defineEmits<{
    (e: 'change', value: any): void
}>()

let items = ref<SelectItem[]>([])

onMounted(async () => await init())

const init = async () => {
    console.log("init select")
    if (props.items instanceof Function) {
        items.value = await props.items()
    } else {
        items.value = await props.items
    }
}

</script>

<style scoped>

</style>