<template>
    <item-list key-prop="key"
               title-prop="key"
               :list="_filters"
               style="margin-bottom: 16px"
               @insert="insertFilter"
               :sortable="false"
    >
        <template #default="{item}">
            <el-form size="small" label-position="top" label-width="80px" :show-message="false" style="margin: 4px">

                <div style="display: flex; flex-direction: row">

                    <FieldSelect style="padding-right: 4px"
                                 :placeholder="$t('filters.field')"
                                 size="small"
                                 :data-source="dataSource"
                                 v-model="item['key']"
                                 @update:model-value="() => item['field'] = getField(item['key'])"
                    />

                    <el-select :placeholder="$t('filters.operator')" size="small" v-model="item['op']">
                        <el-option
                            v-for="op in getOperators(item['key'])"
                            :key="op.key"
                            :label="op.title"
                            :value="op.key"
                        />
                    </el-select>
                </div>

                <div v-if="item['field'] && item['op'] !== 'any' && item['op'] !== 'empty'" style="display: flex; flex-direction: row; margin-top: 4px;">

                    <div style="display: flex; flex-direction: row"  v-if="item['field'].type === 'number'">

                        <el-input-number v-model="item['compare']"
                                         :controls="false"
                                         :precision="item['field'].precision ? item['field'].precision : 0"/>

                        <div v-if="item['op'] === 'between'" style="margin-left: 4px; margin-right: 4px">-</div>
                        <el-input-number v-if="item['op'] === 'between'"
                                         v-model="item['compare_2']"
                                         :controls="false"
                                         :precision="item['field'].precision ? item['field'].precision : 0"/>
                    </div>

                    <div style="display: flex; flex-direction: row"  v-if="item['field'].type === 'string' || item['field'].type === 'text'">

                        <el-input v-model="item['compare']"/>

                    </div>


                    <div style="display: flex; flex-direction: row"  v-if="item['field'].type === 'date' || item['field'].type === 'datetime' || getField(item['key'])?.type === 'time'">

                        <el-date-picker v-model="item['compare']"
                                        :type="item['field'].type"
                                        :format="format(item['field'].type)"
                        />

                        <div v-if="item['op'] === 'between'" style="margin-left: 4px; margin-right: 4px">-</div>

                        <el-date-picker v-if="item['op'] === 'between'"
                                        v-model="item['compare_2']"
                                        :type="item['field'].type"
                                        :format="format(item['field'].type)"
                        />
                    </div>


                    <div>

<!--                        <el-select-->
<!--                            ref="el"-->
<!--                            v-else-if="field && (field.type === 'link')  && !field.isTree"-->
<!--                            class="table-select"-->
<!--                            :model-value="value"-->
<!--                            :placeholder="$t('select')"-->
<!--                            filterable-->
<!--                            remote-->
<!--                            clearable-->
<!--                            remote-show-suffix-->
<!--                            :remote-method="getLinkData"-->
<!--                            :loading="isLoading"-->
<!--                            @change="handleInput"-->
<!--                        >-->
<!--                            <el-option-->
<!--                                v-for="item in linkData"-->
<!--                                :key="item.id"-->
<!--                                :label="item[displayProp]"-->
<!--                                :value="item.id"-->
<!--                            />-->
<!--                        </el-select>-->

                    </div>


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
import {FieldConfigInterface, FieldType} from "../model/field";
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

interface FilterItem extends FilterItemInterface {
    field?: FieldConfigInterface
}

let _filters = ref<FilterItem[]>([])

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

    let field = getField(alias)
    if (!field) {
        console.warn(`Field by alias ${ alias } not found'`)
        return []
    }


    return operators.filter((operator) => {
        return operator.types.includes(field.type)
    })
}

function getField(alias) {
    if (!alias || !props.filters || !props.filters.dataSource)
        return undefined

    return props.filters.dataSource.getFieldByAlias(alias)
}

function format(type) {
    switch (type) {
        case "date": return 'DD.MM.YYYY';
        case "time": return 'HH:MM:SS';
        case "datetime": return 'DD.MM.YYYY HH:MM:SS';
    }
}

</script>

<style scoped>

</style>