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

    <el-form label-position="top">
        <div style="display: flex; flex-direction: row; width: 100%">
            <el-form-item label="Title" style="width: 50%; padding-right: 8px">
                <Input :data-set="dataSet" field="title" />
            </el-form-item>

            <el-form-item label="Alias" style="width: 50%">
                <Input :data-set="dataSet" field="alias" />
            </el-form-item>
        </div>

        <el-form-item label="Source">
            <EnumSelect :data-set="dataSet" field="source" />
        </el-form-item>

        <el-form-item label="Fields">
            <ItemList :data-set="dataSet"
                      field="fields"
                      key-prop="alias"
                      title-prop="title"
                      :list="fields"
                      @edit="editField"
                      @remove="removeField"
                      @insert="insertField"
            />
        </el-form-item>

    </el-form>

    <el-dialog
        v-model="fieldEditDialogVisible"
        title="Edit field"
        width="400px"
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
import {useDataSet} from "../model/dataset";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import Input from "../components/Input.vue";
import EnumSelect from "../components/EnumSelect.vue";
import ItemList from "../components/ItemList.vue";
import {useI18n} from "vue-i18n";
import FieldEdit from "../components/FieldEdit.vue";
import {FieldConfigInterface} from "../model/field";
import _ from 'lodash'

let router = useRouter();
let route = useRoute()
let fields = ref([])
let currentField = ref<FieldConfigInterface>(null)
let currentIndex = -1;
let fieldEditDialogVisible = ref(false)
const { t } = useI18n();

let dataSet = ref(useDataSet({
    dataSource: 'datasource',
    alias: 'datasources',
    autoOpen: false,
    autoCommit: false
}))

onMounted(async () => {
    let n = !route.params.id || route.params.id === 'new'
    await dataSet.value.openOne( n ? undefined : <string>route.params.id)

    fields.value = dataSet.value.current.fields
    //@ts-ignore
    document.title = `Data source ${ n ? 'new' : ' ' + dataSet.value.current.title } | ${import.meta.env.VITE_APP_TITLE}`
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

function saveField() {
    fieldEditDialogVisible.value = false;

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

</style>