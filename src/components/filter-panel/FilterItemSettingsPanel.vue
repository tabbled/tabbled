<template>
    <div>
        <EditableLabel class="pl-4 pr-4 pt-2 pb-2 mb-4 border-b rounded-t"
                       v-model="modelValue.title"
                       placeholder="Enter title"
                       @update:modelValue="emit('change')"
        />
    <div class="relative flex flex-col gap-y-3 pl-4 pr-4">
        <div class="flex flex-col w-full">
            <label class="mb-1" for="fieldSelect">{{ $t('filters.field') }}</label>
            <el-select
                class=""
                id="fieldSelect"
                filterable
                v-model="modelValue.field"
                remote
                clearable
                remote-show-suffix
                fit-input-width
                :remote-method="getData"
                @change="(val) => changeField(val)"
            >
                <el-option
                    v-for="item in fields"
                    :key="item.key"
                    :label="item.title"
                    :value="item.key"
                />
            </el-select>
        </div>

        <div class="flex flex-col w-full">
            <label class="mb-1" for="operationSelect">{{$t('filters.operator')}}</label>
            <el-select id="operationSelect" class="w-full"
                       :placeholder="$t('filters.operator')"
                       @change="emit('change')"
                       v-model="modelValue.operation">
                <el-option
                    v-for="op in operators.filter(f => f.types.includes(field.type))"
                    :key="op.key"
                    :label="op.title"
                    :value="op.key"
                />
            </el-select>
        </div>

        <div class="flex flex-col w-full">
            <label class="mb-1" for="widthInput">{{$t('filters.width')}}</label>
            <el-input id="widthInput" v-model="modelValue.width" @input="emit('change')"/>
        </div>

        <div v-if="field && ['date', 'time', 'datetime'].includes(field.type)"
             class="flex flex-col w-full"
        >
            <label class="mb-1" for="formatInput">{{$t('filters.format')}}</label>
            <el-input id="formatInput" v-model="modelValue.format" @change="emit('change')"/>
        </div>

        <div v-if="field && ['enum', 'link'].includes(field.type)"
             class="flex flex-col w-full"
        >
            <label class="mb-1" for="widgetSelect">{{$t('filters.widget')}}</label>
            <el-select id="widgetSelect" class="w-full"
                       :placeholder="$t('filters.widget')"
                       @change="emit('change')"
                       v-model="modelValue.widget">
                <el-option
                    v-for="wdg in widgets.filter(f=>f.types.includes(field.type))"
                    :key="wdg.key"
                    :label="wdg.title"
                    :value="wdg.key"
                />
            </el-select>
        </div>


    </div>
    <div class="visible flex flex-row-reverse pl-4 pr-4 border-t gap-x-1 mt-5">
        <el-button text @click="emit('close')">Ok</el-button>
        <el-button class="hover:text-red-500" text @click="emit('remove')">Remove</el-button>
    </div>
    </div>
</template>

<script lang="ts" setup>

import EditableLabel from "../EditableLable/EditableLabel.vue";
import {onMounted, ref} from "vue"
import {FilterPanelItemInterface} from "./index";
import {DataSetInterface} from "../dataset";
import {StandardQueryOperator} from "../../model/filter";
import {FieldType, FieldInterface} from "../../model/field";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
    modelValue: FilterPanelItemInterface
    dataset: DataSetInterface
}>()

interface Operator {
    key: StandardQueryOperator,
    title: string,
    types: FieldType[]
}

let fields = ref<Array<{key: string, title: string}>>([])
let field = ref<FieldInterface>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void,
    (e: 'change'): void,
    (e: 'close'): void
    (e: 'remove'): void
}>()

onMounted(async () => {
    await getData()
    //changeField(props.modelValue.field)
    field.value = props.dataset.getFieldByAlias(props.modelValue.field)
})

let widgets = [{
    key: "select",
    title: "Select",
    types: ["link", "enum"]
},{
    key: "buttons",
    title: "Buttons",
    types: ["enum"]
},{
    key: "list",
    title: "List",
    types: ["link"]
}]

let operators: Operator[] = [
    { key: '==',  title: t("filters.=="), types: ['number', 'string', 'text', 'link', 'date', 'time', 'datetime', 'bool', 'enum'] },
    { key: 'in',  title: t("filters.in"), types: ['enum', 'link'] },
    { key: '>',  title: t("filters.>"), types: ['number', 'date', 'time', 'datetime'] },
    { key: '<',  title: t("filters.<"), types: ['number', 'date', 'time', 'datetime'] },
    { key: '>=',  title: t("filters.>="), types: ['number', 'date', 'time', 'datetime'] },
    { key: '<=',  title: t("filters.<="), types: ['number', 'date', 'time', 'datetime'] },
    { key: 'between', title: t("filters.between"), types: ['number', 'date', 'time', 'datetime'] }
]



const getData = async (e?) => {
    fields.value = []
    let arr = await props.dataset.getFields()
    if (e) {
        arr = arr.filter(f => f.alias.toLowerCase().includes(e) || f.title.toLowerCase().includes(e))
    }

    for(const i in arr) {
        fields.value.push({
            key: arr[i].alias,
            title: arr[i].title
        })
    }
}

const changeField = (e) => {
    if (!e) {
        field.value = null
    } else {
        field.value = props.dataset.getFieldByAlias(e)
    }
    props.modelValue.operation = null
    emit('change')
}

</script>

<style scoped>

</style>