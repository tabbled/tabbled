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

        <el-form-item style="padding-left: 8px; width: 100px">
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

        <el-form-item :label="t('permissions')" >
                <el-checkbox v-model="userEntity.permissions['admin']" :label="t('admin')"/>
        </el-form-item>



    </el-form>

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

let router = useRouter();
let route = useRoute();
const { t } = useI18n();
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let userEntity = ref(null)
let isNew = ref(false)
const settings = useSettings()


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

    if (!route.params.id || route.params.id === 'new') {
        userEntity.value = await generateEntityWithDefault(datasource.fields)
        isNew.value = true
    } else {
        userEntity.value = await datasource.getById(<string>route.params.id)
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
            await datasource.updateById(userEntity.value.id, userEntity.value)
        }

        ElMessage.success(t('saved'))
    }catch (e) {
        ElMessage.error(e.toString())
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