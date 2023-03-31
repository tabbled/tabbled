<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{route.meta.title}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button text @click="exportConfig">
                    <template #icon>
                        <Icon width="26" icon="mdi:export"></Icon>
                    </template>
                    Export
                </el-button>
                <el-button @click="cancel">Cancel</el-button>
                <el-button @click="save" type="primary">Save</el-button>
            </div>
        </template>
    </el-page-header>

    <el-form label-position="top" :style="{ 'height': availableHeight }" ref="main">
        <div style="display: flex; flex-direction: row; width: 100%;">
            <el-form-item label="Title" style="width: 50%; padding-right: 8px">
                <Input :data-set="dataSet" field="title" />
            </el-form-item>

            <el-form-item label="Alias" style="width: 50%">
                <Input :data-set="dataSet" field="alias" />
            </el-form-item>

            <el-form-item label="Source" style="padding-left: 8px">
                <EnumSelect :data-set="dataSet" field="source" />
            </el-form-item>

            <el-form-item label="Is tree" style="padding-left: 8px; width: 100px">
                <CheckboxField :data-set="dataSet" field="isTree" />
            </el-form-item>
        </div>

        <el-tabs v-model="activeTab" class="demo-tabs">
            <el-tab-pane label="Fields" name="fields">

                <el-form-item >
                    <ItemList key-prop="alias"
                              title-prop="title"
                              :list="fields"
                              @edit="editField"
                              @remove="removeField"
                              @insert="insertField"
                    >
                        <template #default="{item}">
                            <el-tag style="width: 60px">{{item['type']}}</el-tag>
                            <div style="margin-left: 16px">
                                {{item['title']}}
                            </div>
                        </template>
                    </ItemList>
                </el-form-item>

            </el-tab-pane>
            <el-tab-pane label="Data" name="data">
                <DataSetActionPanel context=""
                                    :data-set="testDataSet"
                                    style="padding-bottom: 16px"
                />
                <Table :columns="testTableColumn"
                       id="testDataSourceTable"
                       context=""
                       :data-set="testDataSet"
                       :is-inline-editing="true"
                       :is-readonly="false"
                />
            </el-tab-pane>

            <el-tab-pane v-if="dataSet && dataSet.current && dataSet.current['source'] === 'custom'"
                         label="Script"
                         name="script"
                         style="padding-right: 2px;"
            >
                <div>
                    <el-button text type="primary" style="margin-bottom: 8px"  @click="tryBuildDataSource">
                        <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                        Run
                    </el-button>
                    <CodeEditor :data-set="dataSet"
                                field="script"
                                format="javascript"
                                :runnable="false"
                                :max-height="availableHeight"
                    />
                </div>

            </el-tab-pane>

            <el-tab-pane v-if="dataSet && dataSet.current && dataSet.current['source'] === 'custom'"
                         label="Context"
                         name="context"
                         style="padding-right: 2px"
            >
                <CodeEditor :data-set="dataSet"
                            field="context"
                            format="json"
                            :runnable="false"
                            :max-height="availableHeight"

                />
            </el-tab-pane>
        </el-tabs>




    </el-form>

    <el-dialog
        v-model="fieldEditDialogVisible"
        title="Edit field"
        width="500px"
    >
        <field-edit :model-value="currentField"/>
        <template #footer>
          <span class="dialog-footer">
              <el-button @click="fieldEditDialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="saveField">Save</el-button>
          </span>
        </template>
    </el-dialog>

</div>
</template>

<script setup lang="ts">

import {ElMessage, ElMessageBox} from "element-plus";
import {DataSet, useDataSet} from "../model/dataset";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import Input from "../components/Input.vue";
import EnumSelect from "../components/EnumSelect.vue";
import ItemList from "../components/ItemList.vue";
import {useI18n} from "vue-i18n";
import FieldEdit from "../components/FieldEdit.vue";
import {FieldConfigInterface} from "../model/field";
import _ from 'lodash'
import {CustomDataSource, DataSourceInterface, DataSourceType} from "../model/datasource";
import CheckboxField from "../components/CheckboxField.vue";
import {ColumnConfigInterface} from "../model/column";

let router = useRouter();
let route = useRoute()
let fields = ref([])
let currentField = ref<FieldConfigInterface>(null)
let currentIndex = -1;
let fieldEditDialogVisible = ref(false)
const { t } = useI18n();
let activeTab = ref('fields')
let availableHeight = ref(0)

let dataSet = ref(useDataSet({
    dataSource: 'datasource',
    alias: 'datasources',
    autoOpen: false,
    autoCommit: false
}))

let testDataSet = ref<DataSet>(null)
let testDataSource = ref<DataSourceInterface>(null)
let testTableColumn = ref<ColumnConfigInterface[]>([])

onMounted(async () => {
    let n = !route.params.id || route.params.id === 'new'
    await dataSet.value.openOne( n ? undefined : <string>route.params.id)

    fields.value = dataSet.value.current.fields
    // @ts-ignore
    let appTitle = import.meta.env.VITE_APP_TITLE ? import.meta.env.VITE_APP_TITLE : 'Tabbled'
    document.title = `Data source ${ n ? 'new' : ' ' + dataSet.value.current.title } | ${ appTitle }`

    availableHeight.value = window.innerHeight - 260
});

async function exportConfig() {
    let data = JSON.stringify(dataSet.value.current, null, 4)
    let file = new Blob([data]);
    let a = document.createElement("a"),
        url = URL.createObjectURL(file)

    a.href = url;
    a.download = `datasource-${dataSet.value.current.alias}.json`;
    document.body.appendChild(a);
    a.click();

    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

async function save() {
    try {
        console.log(dataSet.value.current)
        await dataSet.value.commit()
        ElMessage.success('Saved successfully')
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function cancel() {
    if (dataSet.value.isChanged()) {
        console.log("changed")
        dataSet.value.rollback()
    }

    router.back()
}

function context() {
    try {
        return JSON.parse(dataSet.value.current.context)
    }
    catch (e) {
        console.error(e)
        return {}
    }
}

async function tryBuildDataSource() {

    let dataSource = new CustomDataSource({
        alias: dataSet.value.current['alias'],
        type: DataSourceType.data,
        fields: dataSet.value.current['fields'],
        script: dataSet.value.current['script'],
        isTree: dataSet.value.current['isTree'],
        readonly: false
    })

    dataSource.setContext(context())
    dataSource.setScript(dataSet.value.current['script'])
    await dataSource.init()

    try {
        await dataSource.compile()
        console.log(dataSource.model)
    } catch (e) {
        console.error(e)
    }


    testDataSource.value = dataSource

    testDataSet.value = new DataSet({
        alias: "test",
        dataSource: "",
        autoCommit: false,
        autoOpen: false
    },
        testDataSource.value)

    openTestDataSet()
}

function openTestDataSet() {
    if (!testDataSet.value)
        return;

    testTableColumn.value = []
    testDataSource.value.fields.forEach((field => {
        testTableColumn.value.push({
            id: field.alias,
            field: field.alias,
            width: 100,
            title: field.title
        })
    }))

    testDataSet.value.setContext(context())
    testDataSet.value.open()
    testDataSet.value.data = []
}

function saveField() {
    fieldEditDialogVisible.value = false;

    console.log(currentField.value)

    if (currentIndex == -1) {
        fields.value.push(currentField.value)
    } else {
        fields.value[currentIndex] = currentField.value
    }

    dataSet.value.update('fields', fields.value)
}

function insertField() {
    currentField.value = {
        alias: "",
        title: "",
        type: "string"
    }
    currentIndex = -1;
    fieldEditDialogVisible.value = true
}

function editField(row) {
    currentField.value = _.cloneDeep(fields.value[row])
    currentIndex = row;
    fieldEditDialogVisible.value = true
}

function removeField(row) {
    ElMessageBox.confirm(
        t('confirmDeleteTitle'),
        t('delete'),
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    )
        .then(() => {
            fields.value.splice(row, 1)
            dataSet.value.update('fields', fields.value)
        })
}

</script>

<style scoped>

.demo-tabs {
    max-height: 300px;
}

</style>