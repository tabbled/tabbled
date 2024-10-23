<template>
    <el-select v-if="field && field.type === 'enum'"
               class="filter-panel-select-item"
               :model-value="value"
               @change="onChange"
               :multiple="item.operation === 'in' || item.operation === '!in'"
               collapse-tags
    >
        <el-option
            v-for="item in field.enumValues"
            :key="item.key"
            :label="item.title"
            :value="item.key"
        />
    </el-select>
</template>

<script setup lang="ts">
import {FilterPanelItemInterface} from "./index";
import {FieldInterface} from "../../model/field";
import {onMounted} from "vue";

interface Props {
    item: FilterPanelItemInterface
    value: any
    field: FieldInterface
}
const props = withDefaults(defineProps<Props>(), {
    value: () => null
})

const emit = defineEmits<{
    (e: 'change', value): void
}>()

onMounted(() => {
    console.log(props.field)
})

const onChange = (e) => {
    emit('change', e)
}

</script>

<style lang="scss">
.filter-panel-select-item {
    min-width: 150px;
}
</style>