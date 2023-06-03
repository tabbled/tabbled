<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{route.meta.title}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button @click="router.back()">{{$t('cancel')}}</el-button>
                <el-button @click="save" type="primary">{{$t('save')}}</el-button>
            </div>
        </template>
    </el-page-header>

    <el-form label-position="top">
        <el-form-item :label="$t('lang')">
            <el-select filterable
                       v-model="lang"
            >
                <el-option
                    v-for="locale in $i18n.availableLocales"
                    :key="`locale-${locale}`"
                    :label="locale"
                    :value="locale"
                />
            </el-select>
        </el-form-item>
    </el-form>

</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {useI18n} from 'vue-i18n'
import {useStore} from "vuex";

let router = useRouter();
let route = useRoute()
let lang = ref('en')
let store = useStore()



const { t } = useI18n();


onMounted(async () => {
    await load()
});


async function load() {
    let user = store.getters["auth/user"]
    if (user && user.settings && user.settings.lang) {
        lang.value = user.settings
    }
}

async function save() {
    try {

        ElMessage.success(t('saved'))
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}



</script>

<style scoped>

</style>