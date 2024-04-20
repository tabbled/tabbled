<template>
    <el-dialog class="dialog"
               :model-value="visible"
               style="padding: 16px"
               @close="emit('update:visible', false)"
               :title="t('import')"
               :modal="true"
               draggable
               :width="'60%'"
               :append-to-body="true"
    >


        <div style="display: flex; flex-direction: column; margin-left: 24px">

            <el-input ref="inputFile" readonly :model-value="filename" @click="loadConfigFile">
                <template #append>
                    <el-button @click="loadConfigFile">
                        <Icon style="width: 24px" icon="ic:twotone-search"/>
                    </el-button>
                </template>
            </el-input>
            <div style="display: flex; flex-direction: row">
                <div style="display: flex; flex-direction: column; margin-right: 16px" >
                    <el-checkbox :disabled="!configLoaded || !hasConfig"  v-model="importConfig">{{$t('configuration')}}</el-checkbox>
                    <el-checkbox :disabled="!configLoaded || !hasConfig"  v-model="clearConfig">{{$t('clearConfig')}}</el-checkbox>
                    <el-select :disabled="!configLoaded || !hasConfig" v-model="configConflictAction" :placeholder="$t('conflictResolveType')">
                        <el-option
                            v-for="item in optionsConflictType"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                    <el-checkbox :disabled="!configLoaded || !hasConfig" v-model="importPartially">{{$t('importConfigSelectItems')}}</el-checkbox>
                </div>
                <div style="display: flex; flex-direction: column">
                    <el-checkbox :disabled="!configLoaded || !hasData" v-model="importData">{{$t('data')}}</el-checkbox>
                    <el-checkbox :disabled="!configLoaded || !hasData" v-model="clearData">{{$t('clearData')}}</el-checkbox>
                    <el-select :disabled="!configLoaded || !hasData" v-model="dataConflictAction" :placeholder="$t('conflictResolveType')">
                        <el-option
                            v-for="item in optionsConflictType"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </div>


            </div>

        </div>
        <el-tree v-if="importPartially"
                 ref="configTree"
                 :data="importConfigData"
                 node-key="key"
                 :props="treeProps"
                 show-checkbox
                 check-on-click-node
        >
        </el-tree>
        <template #footer>
            <span>
                <el-text v-if="configLoaded" class="mx-1" style="margin-right: 16px;  ">{{'Version: ' +  importConfigVersion + '; rev: ' + importConfigRev}}</el-text>
                <el-button @click="emit('update:visible', false)">{{$t('cancel')}}</el-button>
                <el-button :loading="inProgress" :disabled="!configLoaded" type="primary" @click="importAll">{{$t('import')}}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import {ref} from "vue";
//import {useSocketClient} from "../../services/socketio.service";
import {useApiClient} from '../../services/api.service'
import {ElMessage} from "element-plus";
import {useI18n} from "vue-i18n";
const { t } = useI18n();

const emit = defineEmits(['update:visible'])
const props = defineProps<{
    visible: boolean,
}>()

const treeProps = {
    children: 'children',
    label: 'label',
    disabled: 'disabled'
}

const optionsConflictType = [{
    value: 'skip',
    label: t('conflictResolveSkip')
},{
    value: 'replace',
    label: t('conflictResolveReplace')
}]

let importConfigFile = null
let configTree = ref(null)
let importConfigVersion = ref(null)
let importConfigRev = ref(null)
let importConfigData = ref(null)
let importEntireConfig = ref(true)
let importData = ref(true)
let importConfig = ref(true)
let importPartially = ref(false)
let configLoaded = ref(false)
let inputFile = ref(null)
let filename = ref('')
const api = useApiClient()
let clearData = ref(false)
let clearConfig = ref(false)
let dataConflictAction = ref('replace')
let configConflictAction = ref('replace')
let inProgress = ref(false)
let hasConfig = ref(false)
let hasData = ref(false)

async function importAll() {
    if (inProgress.value)
        return
    console.log('Start import')
    console.log(importConfigFile)
    try {

        inProgress.value = true
        await api.post('config/import', {
            version: importConfigFile.version,
            rev: importConfigFile.rev,
            importConfig: importEntireConfig.value,
            importData: importData.value,
            partially: importPartially.value,
            selected: importPartially.value ? configTree.value.getCheckedKeys() : undefined,
            configuration: importConfigFile.configuration,
            data: importData.value && importConfigFile.data ?  importConfigFile.data : undefined,
            clearData: clearData.value,
            clearConfig: clearConfig.value,
            dataConflictAction: dataConflictAction.value,
            configConflictAction: dataConflictAction.value
        })

        console.log("Loading configuration have finished. Reload the page")
        ElMessage.success(t('importSuccess'))
    } catch (e) {
        console.error(e)
        ElMessage.error(t('importError'))
    } finally {
        inProgress.value = false
    }
}

function loadConfigFile() {
    importData.value = false
    importConfig.value = false
    loadFile().then(data => {
        importConfigFile = JSON.parse(data.toString())
        importConfigData.value = prepareConfigTree(importConfigFile)


        if (!importConfigData.value) {
            ElMessage.error('Config is not valid')
            return
        }

        importData.value = hasData.value
        importConfig.value = hasConfig.value
        configLoaded.value = true
    })
}

function prepareConfigTree(config) {

    if (!config.version || !config.rev)
        return null

    importConfigVersion.value = config.version
    importConfigRev.value = config.rev
    hasData.value = config.data && !!config.data.length

    return [
        prepareItem('page',t('pages')),
        prepareItem('datasource',t('datasources')),
        prepareItem('function',t('functions')),
        prepareItem('report',t('reportTemplates'))
    ]

    function prepareItem(alias, title) {
        let item = {
            key: alias,
            label: title,
            children: [],
            disabled: false
        }



        if (config.configuration[alias] && Array.isArray(config.configuration[alias])) {
            if (!hasConfig.value)
                hasConfig.value = !!config.configuration[alias].length

            for(const i in config.configuration[alias]) {
                let it = config.configuration[alias][i]
                item.children.push({
                    key: `${it.alias}.${it.data.alias}`,
                    label: `${it.data.title} (${it.data.alias})`,
                })
            }
        }

        item.disabled = !item.children.length


        return item
    }
}

function loadFile() : Promise<any> {
    return new Promise( (resolve) => {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _ => {
            filename.value = input.files[0].name
            let files =   Array.from(input.files);
            const fr = new FileReader();
            fr.readAsText(files[0]);
            fr.addEventListener('load', (e) => {
                resolve(e.target.result)
            })
        };
        input.click();
    })
}

</script>

<style scoped>

</style>