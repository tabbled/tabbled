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
        <el-form-item label="Title">
            <Input :data-set="dataSet" field="title" />
        </el-form-item>


        <el-form-item label="Items">
            <Tree :data="items"
                  @insert="insert"
                  @edit="edit"
                  @remove="remove"
                  @change="itemsChanged"
            />
        </el-form-item>
    </el-form>

    <el-dialog
        v-model="menuEditDialogVisible"
        title="Edit menu item"
        width="400px"
    >
        <MenuItemEdit :model-value="currentMenu"/>
        <template #footer>
          <span class="dialog-footer">
              <el-button @click="menuEditDialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="saveMenu">Save</el-button>
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
import Tree from "../components/Tree.vue"
import _ from "lodash"
import { FlakeId } from '../flake-id'
import {useI18n} from "vue-i18n";
import MenuItemEdit from "../components/MenuItemEdit.vue";
import {MenuConfigInterface} from "../model/menu";
let flakeId = new FlakeId()

let router = useRouter();
let route = useRoute();
let items = ref([])
const { t } = useI18n();
let menuEditDialogVisible = ref(false)
let currentMenu = ref<MenuConfigInterface>(null)
let currentId = ref('')

let dataSet = useDataSet({
    dataSource: 'menu',
    alias: 'menus',
    autoOpen: false,
    autoCommit: false
})

onMounted(async () => {
    let n = !route.params.id || route.params.id === 'new'
    await dataSet.openOne( n ? undefined : <string>route.params.id)

    items.value = dataSet.current.items

    //@ts-ignore
    document.title = `Menu ${ n ? 'new' : ' ' + dataSet.current.title } | ${import.meta.env.VITE_APP_TITLE}`
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

function itemsChanged(data) {
    items.value = data
    dataSet.update('items', items.value)
}

async function insert(parentId) {
    let _items =  _.cloneDeep(items.value)
    let _id = (await flakeId.generateId()).toString()
    let child = {
        id: _id,
        title: 'New item',
        path: "/",
        page: "",
        icon: ""
    }

    if (!parentId) {
        _items.push(child)
    } else {
        let item = parentId ? getMenuById(_items , parentId) : dataSet.current

        if (!item.items) {
            item.items = [child]
        } else {
            item.items.push(child)
        }
    }

    items.value = _items
    dataSet.update('items', items.value)
}

function edit(id) {
    currentMenu.value = getMenuById(items.value , id)
    menuEditDialogVisible.value = true
}

function saveMenu() {
    menuEditDialogVisible.value = false;
    let _items =  _.cloneDeep(items.value)

    updateMenuById(_items, currentMenu.value.id, currentMenu.value)

    items.value = _items
    dataSet.update('items', items.value)
}

function remove(id) {
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
            items.value = removeMenuById(_.cloneDeep(items.value), id)
            dataSet.update('items', items.value)
        })

}

function getMenuById(items:any[], id:string): any | undefined {
    if (!id || id === "")
        return undefined;

    for(let i in items) {
        const item = <any>items[i]

        if (item.id === id) {
            return item
        }

        let it = getMenuById(item.items, id)

        if (it)
            return it
    }

    return undefined;
}

function removeMenuById(items:any[], id:string): any | undefined {
    let _items = []
    for(let i in items) {
        const item = <any>items[i]

        if (item.id !== id) {
            _items.push(item)

            if (item.items) {
                item.items = removeMenuById(item.items, id)
            }
        }
    }

    return _items;
}

function updateMenuById(items:any[], id:string, data: MenuConfigInterface) {
    if (!id || id === "")
        return undefined;

    for(let i in items) {
        let item = <any>items[i]

        if (item.id === id) {
            item = data
        }

        getMenuById(item.items, id)
    }
}


</script>

<style scoped>

</style>