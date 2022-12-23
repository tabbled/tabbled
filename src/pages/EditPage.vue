<template>
    <div>Page view {{pageConfig.alias}}</div>
</template>

<script setup lang="ts">
import { useStore } from "vuex"
import { useSocket } from "../services/socketio.service";
import {onMounted, defineProps} from "vue";
import {PageConfigInterface} from "../model/page";

let store = useStore();
let socket = useSocket();

const props = defineProps<{
    pageConfig: PageConfigInterface
}>()

onMounted(() => {
    console.log('onMounted page', props.pageConfig)
})

</script>

<style scoped>

</style>