<template>
    <div class="flex flex-col" ref="itemWrapper">
        <div v-if="item.title" class="relative mb-1 flex flex-row group">
            <div class="w-full ">{{item.title}}</div>
            <div class="absolute invisible right-0 top-1  group-hover:visible">
                <div v-if="editMode" class="hover:opacity-80 opacity-30 border p-0.5 rounded-md shadow-sm cursor-pointer"
                     @click="(e) => emit('open-settings', e, $el)"
                >
                    <SettingsIcon style="width: 16px; height: 16px"/>
                </div>

            </div>
        </div>
        <div v-if="field" class="w-full">

            <el-date-picker style="width: 100%;"
                v-if="field.type === 'datetime'"
                :type="item.operation === 'between' ? 'datetimerange' : 'datetime'"
                @change="e => onChange(e)"
                v-model="value"
                :format="item.format"
            />
            <el-date-picker style="width: 100%;"
                v-else-if="field.type === 'date'"
                :type="item.operation === 'between' ? 'daterange' : 'date'"
                @change="e => onChange(e)"
                v-model="value"
                :format="item.format"
            />
            <FilterPanelSelectItem style="width: 100%;"
                                   v-else-if="field.type === 'enum'"
                                   @change="e => onChange(e)"
                                   :item="item"
                                   :field="field"
                                   :value="value"
            />
            <el-input-number v-else-if="field.type === 'number'"
                             style="width: 100%;"
                             :controls="false"
                             @change="e => onChange(e)"
                             @input="e => onChange(e)"
                             v-model="value"
            />
            <el-input v-else-if="field.type === 'string'"
                      style="width: 100%;"
                      @change="e => onChange(e)"
                      @input="e => onChange(e)"
                      clearable
                      v-model="value"
            />
            <FilterPanelLinkItem style="width: 100%;"
                                 v-else-if="field.type === 'link'"
                                 @change="e => onChange(e)"
                                 :item="item"
                                 :field="field"
                                 :value="value"/>
            <el-select v-else-if="field.type === 'bool'"
                style="width: 100%"
                :model-value="value"
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

                <div class="w-full border opacity-80 flex bg-gray-50 cursor-pointer h-9 rounded hover:border-blue-300 justify-center items-center"
                     @click="e => emit('open-settings', e, $el)">
                    <span>No filter for type {{field.type}}</span>
                </div>
            </div>
        </div>
        <div v-else class="w-full border opacity-80 flex bg-gray-50 cursor-pointer h-9 rounded hover:border-blue-300 justify-center items-center"
        @click="e => openSettings(e, $el)">

            <span v-if="editMode">Set up</span>
            <span v-else>No setup</span>
        </div>
    </div>

</template>

<script setup lang="ts">

import {FilterPanelItemInterface} from "./index";
import {DataSetInterface, FilterItemInterface} from "../dataset";
import {computed, onMounted, ref, watch} from "vue";
import dayjs from "dayjs";
import FilterPanelSelectItem from "./FilterPanelEnumItem.vue";
import SettingsIcon from "../icons/settings-icon.vue";
import FilterPanelLinkItem from "./FilterPanelLinkItem.vue";
import {useI18n} from "vue-i18n"
const {t} = useI18n()

let value = ref([])
let itemWrapper = ref()

interface Props {
    dataset: DataSetInterface
    path: string
    item: FilterPanelItemInterface
    value: any
    editMode: boolean
}

const props = withDefaults(defineProps<Props>(), {
    value: () => null
})

const boolItems = ref([{
    key: "true",
    label: t('filters.true')
},{
    key: "false",
    label: t('filters.false')
}])

const emit = defineEmits<{
    (e: 'change', filter: FilterItemInterface): void
    (e: 'open-settings', event: any, itemWrapper: any): void,
}>()

const field = computed(() => {
    if (!props.dataset)
        return null

    return props.dataset.getFieldByAlias(props.item.field)
})

watch(() => props.value, () => {
    value.value = props.value
})

watch(() => props.item.operation, () => {
    value.value = null
    onChange(null)
})
watch(() => props.item.field, () => {
    value.value = null
    onChange(null)
})

onMounted(() => {
    value.value = props.value
})

const onChange = (value) => {
    let filter: FilterItemInterface = {
        id: props.item.id,
        operation: props.item.operation,
        field: props.item.field,
        compare: props.item.operation === 'between' || props.item.operation === 'in' ? [] : null
    }

    if (value) {
        switch (field.value.type) {
            case "datetime":
            case "date":
            case "time":
                if (filter.operation === 'between') {
                    if (Array.isArray(value)) {
                        filter.compare = []
                        value.forEach(i => {
                            filter.compare.push(dayjs(i).format('YYYYMMDD'))
                        })
                    }
                } else {
                    filter.compare = dayjs(value).format('YYYYMMDD')
                }
                break
            default: filter.compare = value
        }
    }
    emit('change', filter)
}

const openSettings = (e, el) => {
    if (props.editMode)
        emit('open-settings', e, el)
}

</script>

<style lang="scss">

</style>