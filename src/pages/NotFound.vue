<template>
    <div class="page-not-found">
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

<style lang="scss">
    .page-not-found {
        align-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
    }
</style>