<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{$t('datasource')}} </span>
        </template>

        <template #extra>
                <div style="display: flex; align-self: center;">
                    <el-dropdown
                        style="margin-right: 24px; "
                    >
                <span class="dropdown-link">
                            {{$t('import')}}
                           <Icon width="16" style="padding-left: 4px" icon="ic:outline-file-download"></Icon>
                </span>
                        <template #dropdown>
                            <el-dropdown-menu>
<!--                            <el-dropdown-item @click="loadConfigFile">Config</el-dropdown-item>-->
                                <el-dropdown-item @click="importDataDialogVisible = true">{{$t('importData')}}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <el-dropdown
                        style="margin-right: 8px"
                    >
                <span class="dropdown-link">
                            {{$t('export')}}
                           <Icon width="16" style="padding-left: 4px; padding-right: 8px" icon="ic:outline-file-upload"></Icon>
                </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="exportConfig">{{$t('configuration')}}</el-dropdown-item>
<!--                            <el-dropdown-item @click="exportData">Data to *.json</el-dropdown-item>-->
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                    <el-button @click="cancel">{{$t('cancel')}}</el-button>
                    <el-button @click="save" type="primary">{{$t('save')}}</el-button>
                </div>
        </template>
    </el-page-header>

    <el-form label-position="top" :style="{ 'height': availableHeight }" ref="main">
        <div style="display: flex; flex-direction: row; width: 100%;">
            <el-form-item :label="$t('title')" style="width: 30%; padding-right: 8px">
                <Input field="title"
                       :field-config="getField('title')"
                       :model-value="getValue('title')"
                       @change="(val) => setValue('title', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('alias')" style="width: 30%">
                <Input field="alias"
                       :field-config="getField('alias')"
                       :model-value="getValue('alias')"
                       @change="(val) => setValue('alias', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('source')" style="padding-left: 8px; width: 30%">
                <LinkSelect field="source"
                            :field-config="getField('source')"
                            :model-value="getValue('source')"
                            @change="(val) => setValue('source', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('isTree')" style="padding-left: 8px; width: 200px">
                <CheckboxField field="isTree"
                               :field-config="getField('isTree')"
                               :model-value="getValue('isTree')"
                               @change="(val) => setValue('isTree', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('readonly')" style="padding-left: 8px; width: 250px">
                <CheckboxField field="readonly"
                               :field-config="getField('readonly')"
                               :model-value="getValue('readonly')"
                               @change="(val) => setValue('readonly', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('isAggregator')" style="padding-left: 8px; width: 100px">
                <CheckboxField field="isAggregator"
                               :field-config="getField('isAggregator')"
                               :model-value="getValue('isAggregator')"
                               @change="(val) => setValue('isAggregator', val)"
                />
            </el-form-item>
        </div>

        <div v-if="dataSourceEntity && dataSourceEntity.isAggregator" style="display: flex; flex-direction: row;">
            <el-form-item :label="$t('keyFields')" style="padding-left: 8px;min-width: 300px;">
                <el-select
                           :model-value="getValue('keyFields')"
                           clearable
                           @change="(val) => setValue('keyFields', val)"
                           multiple
                           style="width: 100%;"
                >
                    <el-option
                        v-for="item in dataSourceEntity.fields"
                        :key="item['alias']"
                        :label="item['title']"
                        :value="item['alias']"
                    />
                </el-select>
            </el-form-item>

            <el-form-item :label="$t('aggFields')" style="padding-left: 8px;min-width: 300px">
                <el-select
                    :model-value="getValue('aggFields')"
                    clearable
                    @change="(val) => setValue('aggFields', val)"
                    multiple
                    style="width: 100%;"
                >
                    <el-option
                        v-for="item in dataSourceEntity.fields"
                        :key="item['alias']"
                        :label="item['title']"
                        :value="item['alias']"
                    />
                </el-select>
            </el-form-item>
        </div>


        <el-tabs v-model="activeTab" class="demo-tabs" style="; max-height: unset">
            <el-tab-pane :label="$t('fields')" name="fields">

                <el-form-item >
                    <ItemList key-prop="alias"
                              title-prop="title"
                              :list="dataSourceEntity ? dataSourceEntity.fields : []"
                              @edit="editField"
                              @remove="removeField"
                              @insert="insertField"
                              :sortable="true"
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
            <el-tab-pane :label="$t('data')" name="data">
                <Table :columns="columns"
                       id="testDataSourceTable"
                       :context="context"
                       :datasource="dataSourceEntity ? dataSourceEntity.alias : ''"
                       :readonly="false"
                />
            </el-tab-pane>

            <el-tab-pane v-if="dataSourceEntity && dataSourceEntity.source === 'custom'"
                         :label="$t('script')"
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
                         :label="$t('context')"
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
                         :label="$t('events')"
                         name="events"
                         style="padding-right: 2px"
            >

                <ItemList key-prop="alias"
                          title-prop="title"
                          :list="dataSourceEntity && dataSourceEntity.eventHandlers ? dataSourceEntity.eventHandlers : []"
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

            <el-tab-pane v-if="dataSourceEntity"
                         :label="$t('permissions')"
                         name="permissions"
                         style="padding-right: 2px"
            >


                <el-form label-position="top" label-width="30">
                    <el-form-item :label="t('canAdd')">
                        <div style="display: flex; flex-direction: row">
                            <el-select @change="isChanged = true" v-model="dataSourceEntity.permissions.canAdd" style="padding-right: 8px; width: 250px">
                                <el-option
                                    v-for="item in getAccessTypes(t)"
                                    :key="item.alias"
                                    :label="item.title"
                                    :value="item.alias"
                                />
                            </el-select>
                            <UserRoleSelect @update:modelValue="isChanged = true" style="width: 100%" v-if="dataSourceEntity.permissions.canAdd === 'roles'" v-model="dataSourceEntity.permissions.canAddRoles"/>
                        </div>
                    </el-form-item>

                    <el-form-item :label="t('canEdit')">
                        <div style="display: flex; flex-direction: row">
                            <el-select @change="isChanged = true" v-model="dataSourceEntity.permissions.canEdit" style="padding-right: 8px; width: 250px">
                                <el-option
                                    v-for="item in getAccessTypes(t)"
                                    :key="item.alias"
                                    :label="item.title"
                                    :value="item.alias"
                                />
                            </el-select>
                            <UserRoleSelect @update:modelValue="isChanged = true" style="width: 100%" v-if="dataSourceEntity.permissions.canEdit === 'roles'" v-model="dataSourceEntity.permissions.canEditRoles"/>
                        </div>
                    </el-form-item>

                    <el-form-item :label="t('canRemove')">
                        <div style="display: flex; flex-direction: row">
                            <el-select @change="isChanged = true" v-model="dataSourceEntity.permissions.canRemove" style="padding-right: 8px; width: 250px">
                                <el-option
                                    v-for="item in getAccessTypes(t)"
                                    :key="item.alias"
                                    :label="item.title"
                                    :value="item.alias"
                                />
                            </el-select>
                            <UserRoleSelect @update:modelValue="isChanged = true" style="width: 100%" v-if="dataSourceEntity.permissions.canRemove === 'roles'" v-model="dataSourceEntity.permissions.canRemoveRoles"/>
                        </div>
                    </el-form-item>
                </el-form>

            </el-tab-pane>
        </el-tabs>




    </el-form>

    <el-dialog
        v-model="fieldEditDialogVisible"
        :title="t('fieldConfig.editField')"
        width="70%"
        :close-on-press-escape="false"
    >
        <field-edit :model-value="currentField"/>
        <template #footer>
          <span class="dialog-footer">
              <el-button @click="fieldEditDialogVisible = false">{{$t('cancel')}}</el-button>
              <el-button type="primary" @click="saveField">{{$t('save')}}</el-button>
          </span>
        </template>
    </el-dialog>

    <el-dialog
        v-model="eventHandlerEditDialogVisible"
        :title="t('fieldConfig.editEventHandler')"
        width="70%"
    >
        <EventHandlerEdit :model-value="currentEventHandler"/>
        <template #footer>
          <span class="dialog-footer">
              <el-button @click="eventHandlerEditDialogVisible = false">{{$t('cancel')}}</el-button>
              <el-button type="primary" @click="saveEventHandler">{{$t('save')}}</el-button>
          </span>
        </template>
    </el-dialog>


    <el-dialog
        v-model="importDataDialogVisible"
        :title="t('import')"
        width="50%"
    >

        <ImportData :data-source-alias="dataSourceEntity?.alias" @cancel="importDataDialogVisible = false"></ImportData>

    </el-dialog>

</div>
</template>

<script setup lang="ts">

import {ElMessage, ElMessageBox} from "element-plus";
import {onBeforeRouteLeave, useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import Input from "../../components/Input.vue";
import ItemList from "../../components/ItemList.vue";
import {useI18n} from "vue-i18n";
import FieldEdit from "../../components/FieldEdit.vue";
import {FieldConfigInterface, generateEntityWithDefault} from "../../model/field";
import _ from 'lodash'
import {CustomDataSource, DataSourceInterface, DataSourceType} from "../../model/datasource";
import CheckboxField from "../../components/CheckboxField.vue";
import {ColumnConfigInterface} from "../../model/column";
import {useDataSourceService} from "../../services/datasource.service";
import LinkSelect from "../../components/LinkSelect.vue";
import {EventHandlerInterface} from "../../model/eventHandler";
import EventHandlerEdit from "../../components/EventHandlerEdit.vue";
import {useSettings} from "../../services/settings.service";
import ImportData from "../../components/ImportData.vue";
import CodeEditor from "../../components/CodeEditor.vue";
import {getAccessTypes} from "../../model/permissions";
import UserRoleSelect from "../../components/UserRoleSelect.vue";

let router = useRouter();
let route = useRoute()
let currentField = ref<FieldConfigInterface>(null)
let currentEventHandler = ref<EventHandlerInterface>(null)
let currentIndex = -1;
let fieldEditDialogVisible = ref(false)
let currentEventHandlerIndex = -1;
let eventHandlerEditDialogVisible = ref(false)
let importDataDialogVisible = ref(false)
const { t } = useI18n();
let activeTab = ref('fields')
let availableHeight = ref(0)
let dataSourceEntity = ref(null)
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let isNew = ref(false)
let testDataSource: DataSourceInterface = null
const settings = useSettings()
let isChanged = ref(false)


let context = ref<any>(getContext())
let columns = ref<ColumnConfigInterface[]>([])
const functions = ref<Map<string, string>>(new Map())

onMounted(async () => {
    datasource = dsService.dsDataSource
    if (!datasource) {
        console.warn(`Function datasource doesn't exist`)
    }

    await load()
    await initTestDataSource()

    document.title = `${t('datasource')} ${ isNew.value ? 'new' : ' ' + dataSourceEntity.value.title } | ${ window['env']['appTitle'] ? window['env']['appTitle'] : "Tabbled" }`

    availableHeight.value = window.innerHeight - 260

    let ds = dsService.functionDataSource
    let data = (await ds.getMany()).data

    for(const i in data) {
        functions.value.set(data[i].id, data[i].title)
    }
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

    if(!dataSourceEntity.value.permissions)
        dataSourceEntity.value.permissions = {
            canAdd: 'all',
            canEdit: 'all',
            canRemove: 'all'
        }

    isChanged.value = false
}

async  function initTestDataSource() {
    if (!datasource || isNew.value) {
        return;
    }

    testDataSource = await dsService.getByAlias(dataSourceEntity.value.alias)

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

function importData() {

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
    isChanged.value = true
}

async function save() {
    try {
        if (isNew.value) {
            let item = await datasource.insert(dataSourceEntity.value.id, dataSourceEntity.value)
            await router.replace({ params: {id: item.id} })
            await load()
        } else {
            await datasource.updateById(dataSourceEntity.value.id, dataSourceEntity.value)
        }
        ElMessage.success('Saved successfully')
        isChanged.value = false
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

    if (currentIndex == -1) {
        dataSourceEntity.value.fields.push(currentField.value)
    } else {
        dataSourceEntity.value.fields[currentIndex] = currentField.value
    }
    isChanged.value = true
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
    isChanged.value = true
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
            isChanged.value = true
        })
}

function saveEventHandler() {
    eventHandlerEditDialogVisible.value = false;

    if (currentEventHandlerIndex == -1) {
        dataSourceEntity.value.eventHandlers.push(currentEventHandler.value)
    } else {
        dataSourceEntity.value.eventHandlers[currentEventHandlerIndex] = currentEventHandler.value
    }
    isChanged.value = true
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
    isChanged.value = true
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
            isChanged.value = true
        })
}

onBeforeRouteLeave(() => {
    if (isChanged.value) {
        const answer = window.confirm(t('leaveWithoutSavingWarn'))
        if (!answer) return false
    }
    return true
})

</script>

<style scoped>

.demo-tabs {
    max-height: 300px;
}

.dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}

</style>