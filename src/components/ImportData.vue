<template>

    <el-form>

        <el-form-item >
            <el-upload
                style="width: 100%"
                v-model:file-list="fileList"
                drag
                :auto-upload="false"
                :limit="1"
                :on-change="handleChange"
            >
                <el-button type="primary">Click to load data file</el-button>
                <template #tip>
                    <div class="el-upload__tip">
                        json files with a size less than 50MB.
                    </div>
                </template>
            </el-upload>
        </el-form-item>

        <el-form-item>
            <el-checkbox v-model="replaceExisting" label="Replace existing items in datasource"/>
        </el-form-item>

        <el-form-item>
            <el-checkbox disabled v-model="removeNotExisting" label="Remove not existing items in file"/>
        </el-form-item>


    </el-form>


    <div style="display: flex; justify-content: end;">
        <el-button @click="emit('cancel')">Cancel</el-button>
        <el-button :disabled="inProcess" type="primary" @click="importData">{{inProcess ? 'Importing...' : 'Import'}}</el-button>
    </div>

</template>

<script setup lang="ts">

import {ref} from "vue";
import {ElMessage} from "element-plus";
import {useApiClient} from "../services/api.service";
const emit = defineEmits(['imported', 'cancel'])

const props = defineProps<{
    dataSourceAlias: string
}>()

let fileList = ref([])
let replaceExisting = ref(true)
let removeNotExisting= ref(false)
let data = ref(null)
let inProcess = ref(false)

let api = useApiClient()

const handleChange = (uploadFile) => {

    //let files =   Array.from(uploadFiles);
    const fr = new FileReader();
    fr.readAsText(uploadFile.raw);
    fr.addEventListener('load', (e) => {
        loadData(e.target.result)
    })
}

async function loadData(value) {
    console.log(value)
    try {
        data.value = JSON.parse(value)
        if (data.value instanceof Array) {
            ElMessage.success(`Loaded successfully, ${data.value.length} items`)
        } else {
            data.value = null
            fileList.value = []
            ElMessage.error('Loading error: data must be an array')
        }

    } catch (e) {
        ElMessage.error('Loading error: ' + e.toString())
    }
}

async function importData() {
    if (inProcess.value)
        return

    inProcess.value = true

    try {
        let res = await api.post(`/datasources/${props.dataSourceAlias}/data/import`, {
            options: {
                replaceExisting: replaceExisting.value,
                removeNotExisting: removeNotExisting.value
            },
            data: data.value
        })
        ElMessage.success(`Imported. Inserted: ${res.data.total.inserted}; Updated: ${res.data.total.updated}`)
    } catch (e) {
        ElMessage.error('Import error: ' + e.toString())
    } finally {
        inProcess.value = false
    }
}

</script>

<style scoped>

</style>