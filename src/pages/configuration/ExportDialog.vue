<template>
    <el-dialog class="dialog"
               :model-value="visible"
               @close="emit('update:visible', false)"
               :title="$t('export')"
               :modal="true"
               width="400px"
    >
        <el-checkbox v-model="configSelect">{{$t('configuration')}}</el-checkbox>
        <el-checkbox v-model="dataSelect">{{$t('data')}}</el-checkbox>
        <template #footer>
            <el-button type="primary" @click="exportAll">{{$t('export')}}</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {useSocketClient} from "../../services/socketio.service";

const emit = defineEmits(['update:visible'])

const props = defineProps<{
    visible: boolean,
}>()

let configSelect = ref(true)
let dataSelect = ref(true)
const server = useSocketClient()


function saveFile(data: any, filename: string) {
    let file = new Blob([data]);
    let a = document.createElement("a"),
        url = URL.createObjectURL(file)

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

async function exportAll() {
    let config = await server.emit('config/export', {
        config: configSelect.value,
        data: dataSelect.value
    })
    saveFile(JSON.stringify(config), 'configuration.json')
    emit('update:visible', false)
}

</script>

<style scoped>

</style>