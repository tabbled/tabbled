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
                <Input field="title"
                       :field-config="getField('title')"
                       :model-value="getValue('title')"
                       @change="(val) => setValue('title', val)"
                />
            </el-form-item>

            <el-form-item label="Alias" style="width: 50%">
                <Input field="alias"
                       :field-config="getField('alias')"
                       :model-value="getValue('alias')"
                       @change="(val) => setValue('alias', val)"
                />
            </el-form-item>

            <el-form-item label="Source" style="padding-left: 8px">
                <LinkSelect field="source"
                            :field-config="getField('source')"
                            :model-value="getValue('source')"
                            @change="(val) => setValue('source', val)"
                />
            </el-form-item>

            <el-form-item label="Is tree" style="padding-left: 8px; width: 100px">
                <CheckboxField field="isTree"
                               :field-config="getField('isTree')"
                               :model-value="getValue('isTree')"
                               @change="(val) => setValue('isTree', val)"
                />
            </el-form-item>

            <el-form-item label="Readonly" style="padding-left: 8px; width: 100px">
                <CheckboxField field="readonly"
                               :field-config="getField('readonly')"
                               :model-value="getValue('readonly')"
                               @change="(val) => setValue('readonly', val)"
                />
            </el-form-item>
        </div>

        <el-tabs v-model="activeTab" class="demo-tabs">
            <el-tab-pane label="Fields" name="fields">

                <el-form-item >
                    <ItemList key-prop="alias"
                              title-prop="title"
                              :list="dataSourceEntity ? dataSourceEntity.fields : []"
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
                <Table :columns="columns"
                       id="testDataSourceTable"
                       :context="context"
                       :datasource="dataSourceEntity ? dataSourceEntity.alias : ''"
                       :is-inline-editing="true"
                       :is-readonly="false"
                />
            </el-tab-pane>

            <el-tab-pane v-if="dataSourceEntity && dataSourceEntity.source === 'custom'"
                         label="Script"
                         name="script"
                         style="padding-right: 2px;"
            >
                <div>
                    <el-button text type="primary" style="margin-bottom: 8px"  @click="tryBuildDataSource(); save()">
                        <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                        Run
                    </el-button>
                    <CodeEditor
                                field="script"
                                format="javascript"
                                :runnable="false"
                                :max-height="availableHeight"
                                :field-config="getField('script')"
                                :model-value="getValue('script')"
                                @change="(val) => setValue('script', val)"
                    />
                </div>

            </el-tab-pane>

            <el-tab-pane v-if="dataSourceEntity && dataSourceEntity.source === 'custom'"
                         label="Context"
                         name="context"
                         style="padding-right: 2px"
            >
                <CodeEditor field="context"
                            format="json"
                            :runnable="false"
                            :max-height="availableHeight"
                            :field-config="getField('context')"
                            :model-value="getValue('context')"
                            @change="(val) => setValue('context', val)"

                />
            </el-tab-pane>

            <el-tab-pane v-if="dataSourceEntity && dataSourceEntity.source !== 'custom'"
                         label="Events"
                         name="events"
                         style="padding-right: 2px"
            >

                <ItemList key-prop="alias"
                          title-prop="title"
                          :list="dataSourceEntity ? dataSourceEntity.eventHandlers : []"
                          @remove="removeEventHandler"
                          @insert="insertEventHandler"
                          @edit="editEventHandler"
                >
                    <template #default="{item}">
                        <el-tag style="width: 80px">{{item['event']}}</el-tag>
                        <div style="margin-left: 16px; font-size: 14px">
                            {{getEventHandlerTitle(item)}}
                        </div>
                    </template>
                </ItemList>

            </el-tab-pane>
        </el-tabs>




    </el-form>

    <el-dialog
        v-model="fieldEditDialogVisible"
        title="Edit field"
        width="70%"
    >
        <field-edit :model-value="currentField"/>
        <template #footer>
          <span class="dialog-footer">
              <el-button @click="fieldEditDialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="saveField">Save</el-button>
          </span>
        </template>
    </el-dialog>

    <el-dialog
        v-model="eventHandlerEditDialogVisible"
        title="Edit event handler"
        width="70%"
    >
        <EventHandlerEdit :model-value="currentEventHandler"/>
        <template #footer>
          <span class="dialog-footer">
              <el-button @click="eventHandlerEditDialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="saveEventHandler">Save</el-button>
          </span>
        </template>
    </el-dialog>

</div>
</template>

<script setup lang="ts">

import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import Input from "../components/Input.vue";
import ItemList from "../components/ItemList.vue";
import {useI18n} from "vue-i18n";
import FieldEdit from "../components/FieldEdit.vue";
import {FieldConfigInterface, generateEntityWithDefault} from "../model/field";
import _ from 'lodash'
import {CustomDataSource, DataSourceInterface, DataSourceType} from "../model/datasource";
import CheckboxField from "../components/CheckboxField.vue";
import {ColumnConfigInterface} from "../model/column";
import {useDataSourceService} from "../services/datasource.service";
import LinkSelect from "../components/LinkSelect.vue";
import {EventHandlerInterface} from "../model/eventHandler";
import EventHandlerEdit from "../components/EventHandlerEdit.vue";

let router = useRouter();
let route = useRoute()
let currentField = ref<FieldConfigInterface>(null)
let currentEventHandler = ref<EventHandlerInterface>(null)
let currentIndex = -1;
let fieldEditDialogVisible = ref(false)
let currentEventHandlerIndex = -1;
let eventHandlerEditDialogVisible = ref(false)
const { t } = useI18n();
let activeTab = ref('fields')
let availableHeight = ref(0)
let dataSourceEntity = ref(null)
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let isNew = ref(false)
let testDataSource: DataSourceInterface = null


let context = ref<any>(getContext())
let columns = ref<ColumnConfigInterface[]>([])
const functions = ref<Map<string, string>>(new Map())

onMounted(async () => {
    datasource = dsService.getDataSourceByAlias('datasource')
    if (!datasource) {
        console.warn(`Function datasource doesn't exist`)
    }

    await load()
    await initTestDataSource()

    // @ts-ignore
    let appTitle = import.meta.env.VITE_APP_TITLE ? import.meta.env.VITE_APP_TITLE : 'Tabbled'
    document.title = `Data source ${ isNew.value ? 'new' : ' ' + dataSourceEntity.value.title } | ${ appTitle }`

    availableHeight.value = window.innerHeight - 260

    let ds = dsService.getDataSourceByAlias('function')
    let data = await ds.getAll()
    for(const i in data) {
        functions.value.set(data[i].id, data[i].title)
    }
    console.log(functions)
});

async function load() {
    if (!datasource)
        return;

    if (!route.params.id || route.params.id === 'new') {
        dataSourceEntity.value = await generateEntityWithDefault(datasource.fields)
        isNew.value = true
    } else {
        dataSourceEntity.value = await datasource.getById(<string>route.params.id)
        isNew.value = false
    }
}

async  function initTestDataSource() {
    if (!datasource || isNew.value) {
        return;
    }

    testDataSource = await dsService.getDataSourceByAlias(dataSourceEntity.value.alias)

    if (!testDataSource) {
        console.warn(`Test datasource "${dataSourceEntity.value.alias}" not found`)
        return;
    }

    if (testDataSource instanceof CustomDataSource) {
        testDataSource.setContext(context.value)
    }

    testDataSource.fields.forEach(field => {
        columns.value.push({
            id: field.alias,
            field: field.alias,
            width: 100,
            title: field.title
        })
    })

}

async function exportConfig() {
    let data = JSON.stringify(dataSourceEntity.value, null, 4)
    let file = new Blob([data]);
    let a = document.createElement("a"),
        url = URL.createObjectURL(file)

    a.href = url;
    a.download = `datasource-${dataSourceEntity.value.alias}.json`;
    document.body.appendChild(a);
    a.click();

    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function getField(alias) {
    if (!datasource)
        return undefined;
    return datasource.getFieldByAlias(alias)
}

function getValue(alias) {
    if (!dataSourceEntity.value)
        return undefined;

    return dataSourceEntity.value[alias]
}

function setValue(alias, val) {
    if (!dataSourceEntity.value)
        return undefined;

    dataSourceEntity.value[alias] = val
}

async function save() {
    try {
        if (isNew.value) {
            await datasource.insert(dataSourceEntity.value.id, dataSourceEntity.value)
        } else {
            await datasource.updateById(dataSourceEntity.value.id, dataSourceEntity.value)
        }
        ElMessage.success('Saved successfully')
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function cancel() {
    router.back()
}

function getContext() {
    if (!dataSourceEntity.value || dataSourceEntity.value.context)
        return {}

    try {
        return JSON.parse(dataSourceEntity.value.context)
    }
    catch (e) {
        console.error(e)
        return {}
    }
}

async function tryBuildDataSource() {

    let dataSource = new CustomDataSource({
        alias: dataSourceEntity.value.alias,
        type: DataSourceType.data,
        fields: dataSourceEntity.value.fields,
        script: dataSourceEntity.value.script,
        isTree: dataSourceEntity.value.isTree,
        readonly: dataSourceEntity.value.readonly,
    })

    context.value = getContext();

    dataSource.setContext(context.value)
    dataSource.setScript(dataSourceEntity.value.script)
    await dataSource.init()

    try {
        await dataSource.compile()
        console.log(dataSource.model)
    } catch (e) {
        console.error(e)
    }


    testDataSource = dataSource
}

function saveField() {
    fieldEditDialogVisible.value = false;

    console.log(currentField.value)

    if (currentIndex == -1) {
        dataSourceEntity.value.fields.push(currentField.value)
    } else {
        dataSourceEntity.value.fields[currentIndex] = currentField.value
    }
}

function insertField() {
    currentField.value = {
        alias: "",
        title: "",
        type: "string",
        isTree: false,
        isMultiple: false
    }
    currentIndex = -1;
    fieldEditDialogVisible.value = true
}

function editField(row) {
    currentField.value = _.cloneDeep(dataSourceEntity.value.fields[row])
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
            dataSourceEntity.value.fields.splice(row, 1)
        })
}

function saveEventHandler() {
    eventHandlerEditDialogVisible.value = false;

    console.log(currentEventHandler.value)

    if (currentIndex == -1) {
        dataSourceEntity.value.eventHandlers.push(currentEventHandler.value)
    } else {
        dataSourceEntity.value.eventHandlers[currentEventHandlerIndex] = currentEventHandler.value
    }
}

function getEventHandlerTitle(item: EventHandlerInterface) {
    if (item.handler.type === 'function') {
        return `Function: ${functions.value.get(item.handler.functionId)}`
    } else {
        return item.handler.type
    }
}

function insertEventHandler() {

    currentEventHandler.value = {
        event: 'onAdd',
        handler: {
            type: 'function',
            functionId: null
        }
    }
    currentIndex = -1;
    eventHandlerEditDialogVisible.value = true


    if (!dataSourceEntity.value.eventHandlers) {
        dataSourceEntity.value.eventHandlers = []
    }
    dataSourceEntity.value.eventHandlers.push()
}

function editEventHandler(row) {
    currentEventHandler.value = _.cloneDeep(dataSourceEntity.value.eventHandlers[row])
    currentEventHandlerIndex = row;
    eventHandlerEditDialogVisible.value = true
}

function removeEventHandler(row) {
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
            dataSourceEntity.value.eventHandlers.splice(row, 1)
        })
}

</script>

<style scoped>

.demo-tabs {
    max-height: 300px;
}

</style>