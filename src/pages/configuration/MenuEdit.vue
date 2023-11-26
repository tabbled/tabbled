<template>

    <Tree :data="menuEntity"
          @insert="insert"
          @edit="edit"
          @remove="remove"
          @change="val => emit('update:menuEntity', val)"
    />

    <el-dialog
        v-model="menuEditDialogVisible"
        :title="$t('edit')"
        width="40%"
        :append-to-body="true"
    >
        <MenuItemEdit :model-value="currentMenu"/>
        <template #footer>
          <span class="dialog-footer">
              <el-button @click="menuEditDialogVisible = false">{{$t('cancel')}}</el-button>
              <el-button type="primary" @click="saveMenu">{{$t('save')}}</el-button>
          </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">

import {ElMessageBox} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import Tree from "../../components/Tree.vue"
import _ from "lodash"
import { FlakeId } from '../../flake-id'
import {useI18n} from "vue-i18n";
import MenuItemEdit from "../../components/MenuItemEdit.vue";
import {MenuConfigInterface} from "../../model/menu";
import {DataSourceInterface} from "../../model/datasource";
import {useDataSourceService} from "../../services/datasource.service";
import {useSettings} from "../../services/settings.service";
let flakeId = new FlakeId()

let router = useRouter();
let route = useRoute();
const { t } = useI18n();
let menuEditDialogVisible = ref(false)
let currentMenu = ref<MenuConfigInterface>(null)
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
const settings = useSettings()

interface Props {
    menuEntity: any[]
}

const props = withDefaults(defineProps<Props>(), {
    menuEntity: () => []
})

const emit = defineEmits(['update:menuEntity'])

async function insert(parentId) {
    let _items =  _.cloneDeep(props.menuEntity)
    let _id = flakeId.generateId().toString()
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
        let item = parentId ? getMenuById(_items , parentId) : props.menuEntity
        if (!item.items) {
            item.items = [child]
        } else {
            item.items.push(child)
        }
    }

    emit('update:menuEntity', _items)
}

function edit(id) {
    currentMenu.value = getMenuById(props.menuEntity , id)
    menuEditDialogVisible.value = true
}

function saveMenu() {
    menuEditDialogVisible.value = false;
    let _items =  _.cloneDeep(props.menuEntity)

    updateMenuById(_items, currentMenu.value.id, currentMenu.value)
    emit('update:menuEntity', props.menuEntity)
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
            emit('update:menuEntity', removeMenuById(_.cloneDeep(props.menuEntity), id))
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