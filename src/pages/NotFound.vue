<template>
    <div style="width: 100%; text-align: center;">

        <div style="font-size: var(--el-font-size-extra-large); margin-bottom: 24px">{{$t('pageNotFound')}}</div>
        <el-button type="primary" @click="back()">{{$t('back')}}</el-button>
    </div>

</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute()

function back() {
    router.back()
}

</script>

<style scoped>

</style>