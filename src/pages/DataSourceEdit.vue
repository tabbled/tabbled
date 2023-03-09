<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{route.meta.title}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
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

        <el-form-item label="Source" style="width: 50%">
            <EnumSelect :data-set="dataSet" field="source" />
        </el-form-item>

        <el-form-item label="Fields" style="width: 50%">
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
              <el-button type="primary" @click="fieldEditDialogVisible = false">Save</el-button>
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

let router = useRouter();
let route = useRoute()
let fields = ref([])
let currentField = ref<FieldConfigInterface>(null)
let fieldEditDialogVisible = ref(false)
const { t } = useI18n();

let dataSet = useDataSet({
    dataSource: 'datasource',
    alias: 'datasources',
    autoOpen: false,
    autoCommit: false
})

onMounted(async () => {
    let n = !route.params.id || route.params.id === 'new'
    await dataSet.openOne( n ? undefined : <string>route.params.id)

    fields.value = dataSet.current.fields
    //@ts-ignore
    document.title = `Data source ${ n ? 'new' : ' ' + dataSet.current.title } | ${import.meta.env.VITE_APP_TITLE}`
});

async function save() {
    try {
        await dataSet.commit()
        ElMessage.success('Saved successfully')
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function cancel() {
    if (dataSet.isChanged()) {
        console.log("changed")
        dataSet.rollback()
    }

    router.back()
}

function context() {
    try {
        return JSON.parse(dataSet.current.context)
    }
    catch (e) {
        console.error(e)
        return {}
    }
}

function insertField() {
    console.log('insert')
    fieldEditDialogVisible.value = true
}

function editField(row) {
    console.log('edit')
    currentField.value = fields.value[row]
    console.log(
        currentField.value
    )
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
            console.log(row)
            fields.value.splice(row, 1)
        })
}

</script>

<style scoped>

</style>