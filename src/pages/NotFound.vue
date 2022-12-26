<template>
    <div style="width: 100%; text-align: center;">

        <div style="font-size: var(--el-font-size-extra-large); margin-bottom: 24px">Oops... page not found</div>
        <el-button type="primary" @click="router.back()">Back</el-button>
    </div>

</template>

<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter();

</script>

<style scoped>

</style>