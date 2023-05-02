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
            <Input field="title"
                   :model-value="getValue('title')"
                   @change="(val) => setValue('title', val)"
                   :field-config="getField('title')"
            />
        </el-form-item>


        <el-form-item label="Items">
            <Tree :data="menuEntity ? menuEntity.items : []"
                  @insert="insert"
                  @edit="edit"
                  @remove="remove"
                  @change="val => setValue('items', val)"
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
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import Input from "../components/Input.vue";
import Tree from "../components/Tree.vue"
import _ from "lodash"
import { FlakeId } from '../flake-id'
import {useI18n} from "vue-i18n";
import MenuItemEdit from "../components/MenuItemEdit.vue";
import {MenuConfigInterface} from "../model/menu";
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
import {generateEntityWithDefault} from "../model/field";
import {useSettings} from "../services/settings.service";
let flakeId = new FlakeId()

let router = useRouter();
let route = useRoute();
const { t } = useI18n();
let menuEditDialogVisible = ref(false)
let currentMenu = ref<MenuConfigInterface>(null)
let currentId = ref('')
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let menuEntity = ref(null)
let isNew = ref(false)
const settings = useSettings()


onMounted(async () => {
    datasource = dsService.getDataSourceByAlias('menu')

    if (!datasource) {
        console.warn(`Menu datasource doesn't exist`)
    }

    await load()

    document.title = `Menu ${ isNew.value ? 'new' : ' ' + menuEntity.title } | ${settings.title}`
});

function getField(alias) {
    if (!datasource)
        return undefined;
    return datasource.getFieldByAlias(alias)
}

async function load() {
    if (!datasource)
        return;

    if (!route.params.id || route.params.id === 'new') {
        menuEntity.value = await generateEntityWithDefault(datasource.fields)
        isNew.value = true
    } else {
        menuEntity.value = await datasource.getById(<string>route.params.id)
        isNew.value = false
    }
}

async function save() {
    try {
        if (isNew.value) {
            await datasource.insert(menuEntity.value.id, menuEntity.value)
        } else {
            await datasource.updateById(menuEntity.value.id, menuEntity.value)
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

function getValue(alias) {
    if (!menuEntity.value)
        return undefined;

    return menuEntity.value[alias]
}

function setValue(alias, val) {
    if (!menuEntity.value)
        return undefined;

    menuEntity.value[alias] = val
}

async function insert(parentId) {
    let _items =  _.cloneDeep(menuEntity.value.items)
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
        let item = parentId ? getMenuById(_items , parentId) : menuEntity.value
        console.log(item)
        if (!item.items) {
            item.items = [child]
        } else {
            item.items.push(child)
        }
    }

    menuEntity.value.items = _items
    setValue('items', menuEntity.value.items)
}

function edit(id) {
    currentMenu.value = getMenuById(menuEntity.value.items , id)
    menuEditDialogVisible.value = true
}

function saveMenu() {
    menuEditDialogVisible.value = false;
    let _items =  _.cloneDeep(menuEntity.value.items)

    updateMenuById(_items, currentMenu.value.id, currentMenu.value)

    menuEntity.value.items = _items
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
            menuEntity.value.items = removeMenuById(_.cloneDeep(menuEntity.value.items), id)
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