<template>
    <div v-if="!parameter || !parameter.type">
        No settings
    </div>
    <el-date-picker class="w-full"
                    v-if="parameter.type === 'datetime'"
                    type="datetime"
                    @update:model-value="e => onChange(e)"
                    :model-value="getDate()"
                    format="DD.MM.YYYY hh:mm:ss"
                    style="width: 100%;"
    />
    <el-date-picker class="w-full"
                    v-else-if="parameter.type === 'date'"
                    type="date"
                    @update:model-value="e => onChange(e)"
                    :model-value="getDate('YYYYMMDD')"
                    format="DD.MM.YYYY"
                    style="width: 100%;"
    />
    <el-input-number v-else-if="parameter.type === 'number'"
                     class="w-full"

                     :controls="false"
                     @change="e => onChange(e)"
                     @input="e => onChange(e)"
                     :model-value="modelValue"

    />
    <el-select v-else-if="parameter.type === 'enum'"
               class="w-full"
               disabled

    />
    <el-input v-else-if="parameter.type === 'string'"
              class="w-full"
              @change="e => onChange(e)"
              @input="e => onChange(e)"
              clearable
              :model-value="modelValue"
    />
    <el-select v-else-if="parameter.type === 'bool'"
               class="w-full"
               :model-value="modelValue"
               @change="onChange"
               clearable
    >
        <el-option
            v-for="item in boolItems"
            :key="item.key"
            :label="item.label"
            :value="item.key"
        />
    </el-select>
    <div v-else>
        No widget for type {{parameter.type}}
    </div>
</template>

<script setup lang="ts">

import {ReportParameterDto} from "./report.dto";
import {ref} from "vue";
import {useI18n} from "vue-i18n"
import dayjs from "dayjs";
const {t} = useI18n()

const boolItems = ref([{
    key: "true",
    label: t('filters.true')
},{
    key: "false",
    label: t('filters.false')
}])

const emit = defineEmits<{
    (e: 'update:modelValue', value: any): void
}>()

const props = defineProps<{
    parameter: ReportParameterDto,
    modelValue: any,
    id?:any
}>()

const getDate = (format?) => {
    if (!props.modelValue)
        return null

    console.log(props.modelValue)
    console.log(dayjs(props.modelValue, format))

    return dayjs(props.modelValue, format).valueOf()
}

const onChange = (value: any) => {
    console.log(value)
    if (value === null || value === undefined) {
        emit('update:modelValue', null)
        return
    }

    if (props.parameter.type === 'date') {
        emit('update:modelValue', dayjs(value).format('YYYYMMDD'))
        return
    }

    if (props.parameter.type === 'datetime') {
        emit('update:modelValue', dayjs(value).toISOString())
        return
    }

}


</script>

<style scoped>

</style>