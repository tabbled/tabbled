<template>
<div style="margin: auto">It's main component</div>
    <el-button type="primary" style="width: 100%" @click="sendMsg">send</el-button>

</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
    data() {
        return {

        }
    },
    methods: {
        sendMsg() {

            this.$store.dispatch('auth/loadUserSettings')
        }
    }
});

</script>

<style scoped>

</style>