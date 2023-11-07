<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{$t('user')}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button @click="cancel">{{$t('cancel')}}</el-button>
                <el-button @click="save" type="primary">{{$t('save')}}</el-button>
            </div>
        </template>
    </el-page-header>

    <el-form label-position="top">
        <el-form-item :label="t('username')">
            <Input field="username"
                   :model-value="getValue('username')"
                   @change="(val) => setValue('username', val)"
                   :field-config="getField('username')"
                   :disabled="!isNew"
            />
        </el-form-item>

        <el-form-item :label="t('password')">
            <Input field="password"
                   :model-value="getValue('password')"
                   @change="(val) => setValue('password', val)"
                   :field-config="getField('password')"
            />
        </el-form-item>

        <el-form-item v-if="userEntity" style="padding-left: 8px; width: 100px">
            <el-checkbox v-model="userEntity.active" :label="t('active')"/>
        </el-form-item>

        <div style="display: flex; flex-direction: row">
            <el-form-item :label="t('firstname')" style="width: 50%; margin-right: 16px">
                <Input field="firstname"
                       :model-value="getValue('firstname')"
                       @change="(val) => setValue('firstname', val)"
                       :field-config="getField('firstname')"
                />
            </el-form-item>

            <el-form-item :label="t('lastname')" style="width: 50%">
                <Input field="lastname"
                       :model-value="getValue('lastname')"
                       @change="(val) => setValue('lastname', val)"
                       :field-config="getField('lastname')"
                />
            </el-form-item>
        </div>

        <el-form-item v-if="userEntity" :label="t('permissions')" >
            <el-checkbox v-model="userEntity.permissions['admin']" :label="t('admin')"/>
        </el-form-item>

        <el-form-item :label="t('roles')" v-if="userEntity" style="width: 100%">
            <UserRoleSelect v-model="userEntity.permissions['roles']" style="width: 100%"/>

            <template #label>
                <div style="display: flex; flex-direction: row; justify-content: space-between;">
                    <div>
                        {{t('roles')}}
                    </div>
                    <el-button size="small" @click="manageRolesDialogVisible = true">{{t('manageRoles')}}</el-button>
                </div>

            </template>
        </el-form-item>



    </el-form>

    <el-dialog
        v-model="manageRolesDialogVisible"
        :title="$t('manageRoles')"
        width="400px"
    >
            <ItemList key-prop="alias"
                      title-prop="title"
                      :list="roles"
                      @remove="idx => roles.splice(idx, 1)"
                      @insert="roles.push({alias: '', title: ''})"
            >
                <template #default="{item}">
                    <div style="display: flex; width: 90%" >
                        <el-input size="small" style="padding-right: 4px" v-model="item['alias']" placeholder="Alias"></el-input>
                        <el-input size="small" v-model="item['title']" placeholder="Title"></el-input>
                    </div>
                </template>
            </ItemList>

        <template #footer>
          <span class="dialog-footer">
              <el-button @click="manageRolesDialogVisible = false">{{$t('cancel')}}</el-button>
              <el-button type="primary" @click="saveRoles">{{$t('save')}}</el-button>
          </span>
        </template>
    </el-dialog>

</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import Input from "../components/Input.vue";
import {useI18n} from "vue-i18n";
import {DataSourceInterface} from "../model/datasource";
import {useDataSourceService} from "../services/datasource.service";
import {generateEntityWithDefault} from "../model/field";
import {useSettings} from "../services/settings.service";
import _ from "lodash";
import UserRoleSelect from "../components/UserRoleSelect.vue";
import ItemList from "../components/ItemList.vue";
import {useSocketClient} from "../services/socketio.service";

let router = useRouter();
let route = useRoute();
const { t } = useI18n();
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let userEntity = ref(null)
let isNew = ref(false)
const settings = useSettings()
let manageRolesDialogVisible = ref(false)
let roles = ref([])
let socket = useSocketClient()


onMounted(async () => {
    datasource = dsService.usersDataSource

    if (!datasource) {
        console.warn(`User datasource doesn't exist`)
    }

    await load()

    document.title = `${t('user')} ${ isNew.value ? 'new' : ' ' + userEntity.value.username } | ${ window['env']['appTitle']}`
});

function getField(alias) {
    if (!datasource)
        return undefined;
    return datasource.getFieldByAlias(alias)
}

async function load() {
    if (!datasource)
        return;

    await getRoles()

    if (!route.params.id || route.params.id === 'new') {
        userEntity.value = await generateEntityWithDefault(datasource.fields)
        userEntity.value.permissions = {
            admin: false,
            roles: []
        }
        isNew.value = true
    } else {
        userEntity.value = await datasource.getById(<string>route.params.id)
        userEntity.value.password = '*****'
        isNew.value = false
    }
}

async function save() {
    try {
        if (isNew.value) {
            let item = await datasource.insert(userEntity.value.id, userEntity.value)
            await router.replace({params: {id: item.id}})
            await load()
        } else {
            let value = _.cloneDeep(userEntity.value)
            if (value.password === '*****') {
                value.password = undefined
            }

            await datasource.updateById(value.id, value)
        }

        ElMessage.success(t('saved'))
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function saveRoles() {
    try {
        await socket.emit('config/params/set', {
            id: 'roles',
            value: roles.value
        })
        manageRolesDialogVisible.value = false
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function getRoles() {
    try {
        let res = await socket.emit('config/params/get', {
            id: 'roles'
        })
        roles.value = res ? res : []
    } catch (e) {
        console.error(e)
    }
}

async function cancel() {
    router.back()
}

function getValue(alias) {
    if (!userEntity.value)
        return undefined;

    return userEntity.value[alias]
}

function setValue(alias, val) {
    if (!userEntity.value)
        return undefined;

    userEntity.value[alias] = val
}


</script>

<style scoped>

</style>