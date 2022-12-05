<template>
    <div style="padding-top: 24px"></div>
    <img height="60" class="logo" src="../assets/tabbled_logo.svg" alt=""/>
    <h3 style="text-align: center; width: 300px">{{$t('signIn')}}</h3>
    <el-card shadow="never" class="p-0 m-0">



        <el-form class="p-0 m-0" hide-required-asterisk label-position="top" ref="formRef" :model="user" :rules="rules">

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


</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
    data() {
        return {
            user: {
                username: "",
                password: "",
            },
            rules: {
                username: [{
                    required: true,
                    trigger: 'blur',
                }],
                password: [{
                    required: true,
                    trigger: 'blur',
                }]
            },
        }
    },
    mounted() {
        console.log("mounted Login")
    },
    methods: {
        login() {
            this.$root.loginByUsername(this.user.username, this.user.password)

        }
    }
})
</script>

<style scoped>

</style>