<template>
    <div v-if="field">
        <div v-if="item.title" class="filter-item-title">{{item.title}}</div>
        <el-date-picker
            v-if="field.type === 'datetime' && item.operation === 'between'"
            type="datetimerange"
            @change="e => onChange(e)"
            v-model="value"
            :format="item.format"
            :style="{ width: item.width + 'px' }"
        />
        <el-date-picker
            v-else-if="field.type === 'date' && item.operation === 'between'"
            type="daterange"
            @change="e => onChange(e)"
            v-model="value"
            :format="item.format"
            :style="{ width: item.width + 'px' }"
        />
        <FilterPanelSelectItem
            v-else-if="field.type === 'enum'"
            @change="e => onChange(e)"
            :item="item"
            :field="field"
            v-model="value"
        />
        <div v-else>
            No filter for type {{field.type}}
        </div>
    </div>
    <div v-else>
        No field
    </div>
</template>

<script setup lang="ts">

import {FilterPanelItemInterface} from "./index";
import {DataSetInterface, FilterItemInterface} from "../dataset";
import {computed, onMounted, ref, watch} from "vue";
import dayjs from "dayjs";
import FilterPanelSelectItem from "./FilterPanelSelectItem.vue";

let value = ref([])

interface Props {
    dataset: DataSetInterface
    path: string
    item: FilterPanelItemInterface
    value: any
}

const props = withDefaults(defineProps<Props>(), {
    value: () => []
})

const emit = defineEmits<{
    (e: 'change', filter: FilterItemInterface): void
}>()

const field = computed(() => {
    if (!props.dataset)
        return null

    return props.dataset.getFieldByAlias(props.item.field)
})

watch(() => props.value, () => {
    console.log('value change', props.value)
    value.value = props.value
})

onMounted(() => {
    value.value = props.value
})

const onChange = (value) => {

    let filter: FilterItemInterface = {
        id: props.item.id,
        operation: props.item.operation,
        field: props.item.field
    }
    switch (field.value.type) {
        case "datetime":
        case "date":
        case "time":
            if (filter.operation === 'between') {
                if (Array.isArray(value)) {
                    filter.compare = []
                    value.forEach(i => {
                        filter.compare.push(dayjs(i).valueOf())
                    })
                }
            }
            break
        default: filter.compare = value
    }
    console.log(filter)
    emit('change', filter)
}

</script>

<style lang="scss">
.filter-item-title {
    color: var(--el-text-color-regular);
    margin-bottom: 4px;
}
</style>