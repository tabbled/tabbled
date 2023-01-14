<template>
    <div style="max-width: 300px; margin: auto">

    <div style="padding-top: 24px;"></div>
        <div style="text-align: center;">
            <img height="60" class="logo" src="../assets/tabbled_logo.svg" alt=""/>
        </div>

    <h3 style="text-align: center; width: 300px">{{$t('signIn')}}</h3>
    <el-card shadow="never" class="p-0 m-0">



        <el-form class="p-0 m-0" hide-required-asterisk label-position="top" ref="form" :model="user" :rules="rules">

            <el-form-item :label="$t('username')" required prop="username" >
                <el-input v-model="user.username" v-on:keyup.enter="login"/>
            </el-form-item>

            <el-form-item :label="$t('password')" required prop="password">
                <el-input v-on:keyup.enter="login"
                          type="password"
                          show-password
                          v-model="user.password"
                />
            </el-form-item>

        </el-form>



        <el-row>
            <el-button type="primary" style="width: 100%" @click="login">Login</el-button>
        </el-row>
    </el-card>
    </div>

</template>

<script setup lang="ts">

import {onUnmounted, ref} from "vue";
import {useRouter} from 'vue-router'
import {useStore} from "vuex";
import { ElMessage } from 'element-plus'


const router = useRouter();
const store = useStore();

let form = ref(null)
let user = ref({
    username: "",
    password: ""
})
let rules = ref({
    username: [{
        required: true,
        trigger: 'blur',
    }],
        password: [{
        required: true,
        trigger: 'blur',
    }]
})

onUnmounted(() => {
    console.log("mounted Login")
})

async function login() {
    let valid = await validate();
    if (!valid)
        return;
    try {
        await store.dispatch('auth/login', {
            username: user.value.username,
            password: user.value.password
        });

        await store.dispatch('auth/loadUserSettings');

        console.log("logged in")
        ElMessage.success('Logged in')
        router.push('/');

    } catch (e: any) {
        console.error(e)
        ElMessage.error(e.toString())
    }

}
function validate() {
    return new Promise((resolve, reject) => {
        if (!form.value) {
            reject()
            return;
        }
        form.value.validate(async (b) => {
            resolve(b);
        })
    })
}

</script>

<style scoped>

</style>