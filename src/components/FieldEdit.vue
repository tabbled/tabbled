<template>
    <el-form ref="formRef" :model="modelValue" label-width="170px">

        <el-tabs>

            <el-tab-pane :label="t('settings')">
                <el-form-item :label="t('fieldConfig.title')" prop="title">
                    <el-input v-model="modelValue.title"/>
                </el-form-item>

                <el-form-item :label="t('fieldConfig.alias')" prop="alias">
                    <el-input v-model="modelValue.alias"></el-input>
                </el-form-item>

                <el-form-item :label="t('fieldConfig.type')">
                    <el-select v-model="modelValue.type" >
                        <el-option
                            v-for="item in fieldTypes"
                            :key="item.key"
                            :label="item.label"
                            :value="item.key"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>


                <el-form-item v-if="modelValue.type === 'link' || modelValue.type === 'table'"
                              :label="t('fieldConfig.datasource')">
                    <el-select v-model="modelValue.datasource" clearable @change="dataSourceChange">
                        <el-option
                            v-for="item in dataSources"
                            :key="item.key"
                            :label="item.label"
                            :value="item.key"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>


                <el-form-item v-if="modelValue.type === 'link'" :label="t('fieldConfig.isTree')">
                    <el-checkbox :disabled="!!modelValue.datasource" v-model="modelValue.isTree"/>
                </el-form-item>

                <el-form-item v-if="modelValue.type === 'link'" :label="t('fieldConfig.searchDialog')" prop="searchDialog">
                    <el-input v-model="modelValue.searchDialog"/>
                </el-form-item>

                <el-form-item v-if="modelValue.type === 'number'" :label="t('fieldConfig.precision')">
                    <el-input-number v-model="modelValue.precision" controls-position="right" :min="0" :max="9" style="text-align: start"></el-input-number>
                </el-form-item>

                <el-form-item v-if="modelValue.type === 'link' || modelValue.type === 'list' || modelValue.type === 'string' || modelValue.type === 'image' || modelValue.type === 'file'"
                              :label="t('fieldConfig.isMultiple')">
                    <el-checkbox v-model="modelValue.isMultiple"></el-checkbox>
                </el-form-item>

                <el-form-item v-if="modelValue.type !== 'table'" :label="t('fieldConfig.default')">
                    <el-input v-model="modelValue.default"></el-input>
                </el-form-item>

                <el-form-item v-if="modelValue.type === 'number'" :label="t('fieldConfig.format')">
                    <el-select v-model="modelValue.format" >
                        <el-option
                            v-for="item in numberFormats"
                            :key="item.key"
                            :label="item.label"
                            :value="item.key"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item v-if="modelValue.type === 'number' || modelValue.type === 'string' || modelValue.type === 'text' || modelValue.type === 'link'" :label="t('fieldConfig.searchable')">
                    <el-checkbox v-model="modelValue.searchable"/>
                </el-form-item>

                <el-form-item v-if="modelValue.type === 'number'" :label="t('fieldConfig.autoincrement')">
                    <el-checkbox v-model="modelValue.autoincrement"/>
                </el-form-item>

                <el-form-item v-if="modelValue.type !== 'table'" :label="t('fieldConfig.filterable')">
                    <el-checkbox v-model="modelValue.filterable"/>
                </el-form-item>

                <el-form-item v-if="modelValue.type !== 'table'" :label="t('fieldConfig.sortable')">
                    <el-checkbox v-model="modelValue.sortable"/>
                </el-form-item>



                <el-form-item v-if="modelValue.type === 'enum'" :label="t('fieldConfig.values')">
                    <ItemList key-prop="alias"
                              title-prop="title"
                              :list="modelValue.values"
                              @remove="removeEnumItem"
                              @insert="addEnumItem"
                    >
                        <template #default="{item}">
                            <div style="display: flex; width: 90%" >
                                <el-input size="small" style="padding-right: 4px" v-model="item['key']" placeholder="Key"></el-input>
                                <el-input size="small" v-model="item['title']" placeholder="Label"></el-input>
                            </div>
                        </template>
                    </ItemList>
                </el-form-item>



            </el-tab-pane>

            <el-tab-pane :label="t('customizing')">

                <el-form-item :label="t('fieldConfig.getValue')">
                    <CodeEditor v-model="modelValue.getValue"
                                field="script"
                                format="javascript"
                                runnable
                    />
                </el-form-item>

                <el-form-item :label="t('fieldConfig.setValue')">
                    <CodeEditor v-model="modelValue.setValue"
                                field="script"
                                format="javascript"
                                runnable
                    />
                </el-form-item>

                <el-form-item :label="t('fieldConfig.getListValues')">
                    <CodeEditor v-model="modelValue.getListValues"
                                field="script"
                                format="javascript"
                                runnable
                    />
                </el-form-item>

                <el-form-item :label="t('fieldConfig.getReadonly')">
                    <CodeEditor v-model="modelValue.getReadonly"
                                field="script"
                                format="javascript"
                                runnable
                    />
                </el-form-item>

            </el-tab-pane>

        </el-tabs>


    </el-form>

</template>

<script setup lang="ts">

import {getFieldDataTypes} from "../model/field";
import {useI18n} from "vue-i18n";
import {onMounted, ref} from "vue";
import {useDataSourceService} from "../services/datasource.service";
import ItemList from "../components/ItemList.vue";
import CodeEditor from "./CodeEditor.vue";

const { t } = useI18n();

interface ListItem {key: string, label: string}

const fieldTypes = ref<Array<ListItem>>([])
const dataSources = ref<Array<ListItem>>([])

let dsService = useDataSourceService()

let numberFormats:Array<ListItem> = [
    { key: "none", label: "None"},
    { key: "decimal", label: "Decimal"},
    { key: "currency", label: "Currency"}
]

onMounted(async () => {
    getFieldDataTypes().forEach(key => {
        fieldTypes.value.push({
            key: key,
            label: t(`fieldTypes.${key}`)
        })
    })

    let items = (await dsService.dsDataSource.getMany()).data

    items.forEach(item => {
        dataSources.value.push({
            key: item.alias,
            label: item.alias
        })
    })

    dataSources.value.push({
        key: 'users',
        label: 'users'
    })
});

const props = defineProps<{
    modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

function addEnumItem() {
    let newItem = {key: "", title: ""}
    let m = props.modelValue;
    if (!props.modelValue.values) {
        m.values = [newItem]
    } else {
        m.values.push(newItem)
    }
    emit('update:modelValue', m)
}

function removeEnumItem(idx) {
    let m = props.modelValue.values;
    m.splice(idx, 1)
    emit('update:modelValue', m)
}

async function dataSourceChange() {
    let m = props.modelValue;
    let ds = await dsService.getByAlias(props.modelValue.datasource)
    m.isTree = ds && !!ds.isTree

    emit('update:modelValue', m)
}

</script>

<style scoped>

</style>