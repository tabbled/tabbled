<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{$t('mySettings')}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button @click="router.back()">{{$t('cancel')}}</el-button>
                <el-button @click="save" type="primary">{{$t('save')}}</el-button>
            </div>
        </template>
    </el-page-header>

    <el-form label-position="top">
        <el-form-item :label="$t('username')">
            <el-input :disabled="true" v-model="userEntity.username"></el-input>
        </el-form-item>
        <div style="display: flex; flex-direction: row;">
            <el-form-item :label="$t('firstname')" style="width: 50%; margin-right: 16px">
                <el-input v-model="userEntity.firstname"></el-input>
            </el-form-item>
            <el-form-item :label="$t('lastname')" style="width: 50%">
                <el-input v-model="userEntity.lastname" ></el-input>
            </el-form-item>
        </div>
        <el-form-item :label="$t('lang')">
            <el-select filterable
                       v-model="userEntity.settings.lang"
            >
                <el-option
                    v-for="locale in $i18n.availableLocales"
                    :key="`locale-${locale}`"
                    :label="locale"
                    :value="locale"
                />
            </el-select>
        </el-form-item>

        <el-form-item :label="$t('newPassword')" style="width: 50%">
            <el-input show-password type="password" v-model="userEntity.newPassword" ></el-input>
        </el-form-item>
        <el-form-item :label="$t('newPasswordRepeat')" style="width: 50%">
            <el-input show-password type="password" v-model="userEntity.newPasswordRepeat" ></el-input>
        </el-form-item>
        <el-form-item :label="$t('currentPassword')" style="width: 50%">
            <el-input show-password type="password" v-model="userEntity.currentPassword" ></el-input>
        </el-form-item>
    </el-form>

</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {useSocketClient} from "../services/socketio.service";

let router = useRouter();
let route = useRoute()
let server = useSocketClient()
let userEntity = ref({
    settings: {
        lang: 'en'
    },
    username: "",
    firstname: "",
    lastname: "",
    currentPassword: "",
    newPassword: "",
    newPasswordRepeat: ""
})

const { t } = useI18n();


onMounted(async () => {
    await load()
});


async function load() {
    userEntity.value = await server.emit("users/me", {})
}

async function save() {
    if (userEntity.value.newPassword && (userEntity.value.newPassword !== userEntity.value.newPasswordRepeat)) {
        ElMessage.error(t('newPasswordNotEqual'))
        return;
    }
    try {
        await server.emit("users/setMe", userEntity.value)

        ElMessage.success(t('saved'))
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}



</script>

<style scoped>

</style>