<template>
    <item-list key-prop="key"
               title-prop="key"
               :list="_filters"
               style="margin-bottom: 16px"
               @insert="insertFilter"
               :sortable="false"
    >
        <template #default="{item}">
            <el-form size="small" label-position="top" label-width="80px" :show-message="false">




                <div style="display: flex; flex-direction: row">

                    <FieldSelect style="padding-right: 4px" :placeholder="$t('filters.field')" size="small" :data-source="dataSource" v-model="item['key']" />


                    <el-select :placeholder="$t('filters.operator')" size="small" v-model="item['op']">
                        <el-option
                            v-for="op in getOperators(item['key'])"
                            :key="op.key"
                            :label="op.title"
                            :value="op.key"
                        />
                    </el-select>
                </div>

                <div style="display: flex; flex-direction: row">

                </div>


            </el-form>
        </template>

    </item-list>

    <div>
        <el-button v-if="closeButton" @click="emit('close')" size="small">
            {{$t('close')}}
        </el-button>
        <el-button type="primary" @click="apply()" size="small">
            {{$t('apply')}}
        </el-button>
    </div>
</template>

<script lang="ts" setup>

import {FilterItemInterface, Filters, StandardQueryOperator} from "../model/filter";
import ItemList from "./ItemList.vue";
import {ref} from "vue";
import FieldSelect from "./FieldSelect.vue";
import {useI18n} from "vue-i18n";
import {FieldType} from "../model/field";
const { t } = useI18n();

interface Props {
    modelValue: any
    filters?: Filters,
    closeButton?:boolean,
    dataSource:string
}

interface Operator {
    key: StandardQueryOperator,
    title: string,
    types: FieldType[]
}

let _filters = ref<FilterItemInterface[]>([])

let operators: Operator[] = [
    { key: '==',  title: t("filters.=="), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'enum'] },
    { key: '!=', title: t("filters.!="), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'enum'] },
    { key: '>',  title: t("filters.>"), types: ['number', 'date', 'time', 'datetime'] },
    { key: '<',  title: t("filters.<"), types: ['number', 'date', 'time', 'datetime'] },
    { key: '>=',  title: t("filters.>="), types: ['number', 'date', 'time', 'datetime'] },
    { key: '<=',  title: t("filters.<="), types: ['number', 'date', 'time', 'datetime'] },
    { key: 'in',  title: t("filters.in"), types: ['enum'] },
    { key: '!in',  title: t("filters.!in"), types: ['enum'] },
    { key: 'between', title: t("filters.between"), types: ['number', 'date', 'time', 'datetime'] },
    { key: 'contains',  title: t("filters.contains"), types: ['string', 'text'] },
    { key: '!contains', title: t("filters.!contains"), types: ['string', 'text'] },
    { key: 'any', title: t("filters.any"), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'image', 'table', 'enum'] },
    { key: 'empty', title: t("filters.empty"), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'image', 'table', 'enum']}
]

const props = withDefaults(defineProps<Props>(), {
    closeButton: false
})

const emit = defineEmits(['update:modelValue', 'apply', 'close'])


function apply() {
    //props.filters.setFilter()
    emit('apply')
}

function insertFilter() {
    _filters.value.push({
        key:null,
        op:null
    })
}

function getOperators(alias) {
    if (!alias || !props.filters.dataSource)
        return []

    let field = props.filters.dataSource.getFieldByAlias(alias)
    if (!field) {
        console.warn(`Field by alias ${ alias } not found'`)
        return []
    }


    return operators.filter((operator) => {
        return operator.types.includes(field.type)
    })
}

</script>

<style scoped>

</style>