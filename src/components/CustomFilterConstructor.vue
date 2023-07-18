<template>
    <item-list key-prop="key"
               title-prop="key"
               :list="_filters"
               style="margin-bottom: 16px"
               @insert="insertFilter"
               @remove="removeFilter"
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
                                 @update:model-value="fieldChanged(item)"
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

                        <el-select
                            v-if="item['field'].type === 'link'  && !isTree"
                            v-model="item['compare']"
                            :placeholder="$t('select')"
                            filterable
                            remote
                            clearable
                            show-checkbox
                            :multiple="true"
                            remote-show-suffix
                            :remote-method="getLinkData"
                        >
                            <el-option
                                v-for="item in linkData"
                                :key="item.id"
                                :label="item[displayProp]"
                                :value="item.id"
                            />
                        </el-select>

                        <el-tree-select v-if="item['field'].type === 'link'  && isTree"
                                        v-model="item['compare']"
                                        :data="linkData"
                                        :node-key="'id'"
                                        :props="treeProps"
                                        show-checkbox
                                        check-strictly
                                        :multiple="true"
                        />

                        <el-select v-else-if=" item['field'].type === 'enum'"
                                   filterable
                                   v-model="item['compare']"
                                   clearable
                                   style="width: 100%"
                                   show-checkbox
                                   :multiple="true"
                        >
                            <el-option
                                v-for="it in item['field'].values"
                                :key="it.key"
                                :label="it.title"
                                :value="it.key"
                            />
                        </el-select>

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
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
const { t } = useI18n();

interface Props {
    id?: string
    filters?: Filters,
    closeButton?:boolean,
    dataSource:string,
}

const treeProps = {
    children: "children",
    label: "name"
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
let linkData = ref([])
let displayProp = ref('name')
let linkDataSource:DataSourceInterface = null
let dsService = useDataSourceService()
let isTree = ref(false)
let isLoading = ref(false)

let operators: Operator[] = [
    { key: '==',  title: t("filters.=="), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'enum'] },
    { key: '!=', title: t("filters.!="), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'enum'] },
    { key: '>',  title: t("filters.>"), types: ['number', 'date', 'time', 'datetime'] },
    { key: '<',  title: t("filters.<"), types: ['number', 'date', 'time', 'datetime'] },
    { key: '>=',  title: t("filters.>="), types: ['number', 'date', 'time', 'datetime'] },
    { key: '<=',  title: t("filters.<="), types: ['number', 'date', 'time', 'datetime'] },
    { key: 'between', title: t("filters.between"), types: ['number', 'date', 'time', 'datetime'] },
    { key: 'contains',  title: t("filters.contains"), types: ['string', 'text'] },
    { key: '!contains', title: t("filters.!contains"), types: ['string', 'text'] },
    { key: 'any', title: t("filters.any"), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'image', 'table', 'enum'] },
    { key: 'empty', title: t("filters.empty"), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'image', 'table', 'enum']}
]

const props = withDefaults(defineProps<Props>(), {
    closeButton: false
})

const emit = defineEmits(['apply', 'close'])

function apply() {
    let filters = []

    _filters.value.forEach(filter => {
        if (filter.key && filter.op) {
            let f = Object.assign({}, filter)
            delete f.field

            filters.push(f)
        }
    })

    props.filters.setGroup(props.id, filters)
    emit('apply', filters.length)
}

async function insertFilter() {
    _filters.value.push({
        key:null,
        op:null
    })
}

function removeFilter(idx) {
    _filters.value.splice(idx, 1)
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

async function fieldChanged(item) {
    let field = getField(item['key']);

    if (!field)
        return

    let ops = getOperators(item['key'])

    item['field'] = field
    item['op'] = ops.length ? ops[0].key : null
    item['compare'] = null

    if (field.type === 'link') {
        if (field.displayProp)
            displayProp.value = field.displayProp

        linkDataSource = await dsService.getByAlias(field.datasource)

        if (!linkDataSource) {
            console.warn(`Link source "${field.datasource}" for field "${field.alias}" not found`)
            return
        }

        isTree.value = linkDataSource.isTree
        await getLinkData()
    }
}

async function getLinkData(query?: string) {
    if (isLoading.value || !linkDataSource)
        return

    isLoading.value = true

    let opt = {
        take: 50
    }

    if (query) {
        opt['search'] = query
    }

    linkData.value = (await linkDataSource.getMany(opt)).data
    isLoading.value = false
}

</script>

<style scoped>

</style>