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
            <el-form size="small" label-position="top" label-width="80px" :show-message="false" style="margin: 4px; width: 100%">

                <div style="display: flex; flex-direction: row; width: 100%">

                    <FieldSelect style="padding-right: 4px; width: 50%"
                                 :placeholder="$t('filters.field')"
                                 size="small"
                                 :data-source="dataSource"
                                 v-model="item['key']"
                                 @update:model-value="fieldChanged(item)"
                    />

                    <el-select :placeholder="$t('filters.operator')" size="small" v-model="item['op']" style="width: 50%">
                        <el-option
                            v-for="op in getOperators(item['key'])"
                            :key="op.key"
                            :label="op.title"
                            :value="op.key"
                        />
                    </el-select>
                </div>

                <div v-if="item['field'] && item['op'] !== 'any' && item['op'] !== 'empty'" style="display: flex; flex-direction: row; margin-top: 4px; width: 100%">

                    <div style="display: flex; flex-direction: row"  v-if="item['field'].type === 'number'">

                        <el-input-number v-model="item['compare']"
                                         :controls="false"
                                         style="width: 50%"
                                         :placeholder="$t('value')"
                                         :precision="item['field'].precision ? item['field'].precision : 0"/>

                        <div v-if="item['op'] === 'between'" style="margin-left: 4px; margin-right: 4px">-</div>
                        <el-input-number v-if="item['op'] === 'between'"
                                         style="width: 50%"
                                         v-model="item['compare_2']"
                                         :controls="false"
                                         :placeholder="$t('value')"
                                         :precision="item['field'].precision ? item['field'].precision : 0"/>
                    </div>

                    <div style="display: flex; flex-direction: row; width: 100%"  v-if="item['field'].type === 'string' || item['field'].type === 'text'">

                        <el-input v-model="item['compare']" :placeholder="$t('value')" style="width: 100%"/>

                    </div>


                    <div style="display: flex; flex-direction: row; width: 100%"  v-if="item['field'].type === 'date' || item['field'].type === 'datetime' || getField(item['key'])?.type === 'time'">

                        <el-date-picker v-model="item['compare']"
                                        @change="v => setDatetime(item, 'compare', v)"
                                        :type="item['field'].type"
                                        :format="format(item['field'].type)"
                                        style="width: 50%"
                        />

                        <div v-if="item['op'] === 'between'" style="margin-left: 4px; margin-right: 4px">-</div>

                        <el-date-picker v-if="item['op'] === 'between'"
                                        v-model="item['compare_2']"
                                        @change="v => setDatetime(item, 'compare_2', v)"
                                        :type="item['field'].type"
                                        :format="format(item['field'].type)"
                                        style="width: 50%"
                        />
                    </div>


                    <div style="width: 100%">

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
                            style="width: 100%"
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
                                        style="width: 100%"
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

    <div style="display: flex; flex-direction: row; justify-content: space-between">
        <div>
            <el-button v-if="closeButton" @click="emit('close')" size="small">
                {{$t('close')}}
            </el-button>
            <el-button type="primary" @click="apply()" size="small">
                {{$t('apply')}}
            </el-button>
        </div>


        <el-button @click="clear()" size="small">
            {{$t('clear')}}
        </el-button>
    </div>
</template>

<script lang="ts" setup>

import {FilterItemInterface, Filters, StandardQueryOperator} from "../model/filter";
import ItemList from "./ItemList.vue";
import {onMounted, ref} from "vue";
import FieldSelect from "./FieldSelect.vue";
import {useI18n} from "vue-i18n";
import {FieldConfigInterface, FieldType} from "../model/field";
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
import dayjs from "dayjs";
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
    { key: 'empty', title: t("filters.empty"), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'image', 'table', 'enum']},
    { key: '!empty', title: t("filters.notEmpty"), types: ['number', 'string', 'text', 'link', 'list', 'date', 'time', 'datetime', 'bool', 'image', 'table', 'enum']}

]

const props = withDefaults(defineProps<Props>(), {
    closeButton: false
})

const emit = defineEmits(['apply', 'close'])

onMounted(async () => {
    await restoreState()
})

async function restoreState() {
    let state = localStorage.getItem(`${props.id}_filter_state`)
    if (state) {
        _filters.value = JSON.parse(state)
        emit('apply', _filters.value.length)
    }
}

async function backupState() {
    localStorage.setItem(`${props.id}_filter_state`, JSON.stringify(_filters.value))
}

function apply() {
    let filters = []

    _filters.value.forEach(filter => {
        if (filter.key && filter.op) {
            let f = Object.assign({}, filter)
            delete f.field

            filters.push(f)
        }
    })

    console.log(filters)

    backupState()
    props.filters.setGroup(props.id, filters)
    emit('apply', filters.length)

}

function setDatetime(item, compare, value) {
    console.log(item, compare, value)
    item[compare] = dayjs(value).format()
}

function clear() {
    _filters.value = []
    apply()
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