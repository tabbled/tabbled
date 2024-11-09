<template>
    <el-select v-if="field && field.type === 'enum' && (!item.widget || item.widget === 'select')"
               class="filter-panel-select-item"
               :model-value="value"
               @change="onChange"
               :multiple="item.operation === 'in' || item.operation === '!in'"
               clearable
    >
        <el-option
            v-for="item in field.enumValues"
            :key="item.key"
            :label="item.title"
            :value="item.key"
        />
    </el-select>
    <div v-else-if="field && field.type === 'enum' && (!item.widget || item.widget === 'buttons')" >

        <el-checkbox-group v-if="item.operation === 'in' || item.operation === '!in'"
                           :model-value="value"
                           size="small"
                           @change="onChange">
            <el-checkbox-button v-for="item in field.enumValues" :value="item.key" :label="item.title">
                {{ item.title }}
            </el-checkbox-button>
        </el-checkbox-group>
        <el-radio-group v-else
                        :model-value="value" size="small" @change="onChange">
            <el-radio-button v-for="item in field.enumValues" :value="item.key" :label="item.title"/>
        </el-radio-group>
    </div>
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
})

const onChange = (e) => {
    console.log(e)
    emit('change', e)
}

</script>

<style lang="scss">
.filter-panel-select-item {
    min-width: 150px;
}
</style>