<template>
    <el-dialog class="dialog"
               :model-value="visible"
               @close="emit('update:visible', false)"
               :title="$t('firstStartDialogTitle')"
               :modal="true"
               :show-close="false"
               width="400px"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
    >
        <el-text type="info">{{$t('configuration')}}</el-text>
        <div style="display: flex; flex-direction: row; ">
            <div v-for="item in options" :class="{ item: true, selected: selected === item.value }" @click="selected = item.value">
                {{item.label}}
                <Icon :icon="item.icon" width="64" :class="{'icon-selected': selected === item.value, icon: true}"/>
            </div>
        </div>

        <template #footer>
            <el-button :loading='inProgress' type="primary" @click="setup">{{$t('firstStartSetup')}}</el-button>
        </template>

    </el-dialog>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {useApiClient} from "../../services/api.service";
import {useSocketClient} from "../../services/socketio.service";
import {ElMessage} from "element-plus";
import {useI18n} from "vue-i18n";
const api = useApiClient()
let socketClient = useSocketClient()
const { t } = useI18n();

const props = defineProps<{
    visible: boolean,
}>()

let inProgress = ref(false)

const emit = defineEmits(['update:visible', 'selected'])
const options = [{
    label: 'Empty',
    value: 'empty',
    icon: 'mdi:file-remove-outline',
},{
    label: 'Example',
    value: 'example',
    icon: 'mdi:application-cog-outline',
}]

let selected = ref('example')

async function setup() {
    let error = false
    if (selected.value === 'example') {
        let config = await import('./../../examples/configuration.json')
        try {
            inProgress.value = true
            await api.post('config/import', {
                version: config.version,
                rev: config.rev,
                importConfig: true,
                importData: true,
                partially: false,
                selected: undefined,
                configuration: config.configuration,
                data: config.data,
                clearData: false,
                clearConfig: false,
                dataConflictAction: 'replace',
                configConflictAction: 'replace'
            })
            inProgress.value = false
        } catch (e) {
            console.error(e)
            error = true
            ElMessage.error(t('importError'))
        }
    }

    if (error)
        return

    await socketClient.emit('config/params/set', {
        id: '__installedConfig',
        value: selected.value
    })

    emit('selected', {
        config: selected.value
    })
    emit('update:visible', false)
}

</script>

<style lang="scss">
    .item {
        width: 100px;
        height: 100px;
        border-radius: 4px;
        border: var(--el-color-primary-light-3);
        border-width: 1px;
        border-style: solid;
        background: var(--el-color-primary-light-10);
        margin: 4px;
        display: flex;
        flex-flow: column;
        align-items: center;
    }

    .item:hover {
        background: var(--el-color-primary-light-8);
    }

    .selected {
        background: var(--el-color-primary-light-3);
        outline: var(--el-color-primary-light-3);
    }
    .selected:hover {
        background: var(--el-color-primary-light-3);
        outline: var(--el-color-primary-light-3);
    }

    .icon {
        opacity: 0.4;
        color: var(--el-color-primary-light-3);
        z-index: 10
    }

    .icon-selected {
        color: var(--el-color-primary-light-1);
        opacity: 0.6;
    }
</style>