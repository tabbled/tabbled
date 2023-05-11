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
            <el-checkbox v-model="removeNotExisting" label="Remove not existing items in file"/>
        </el-form-item>


    </el-form>


    <div style="display: flex; justify-content: end;">
        <el-button @click="">Cancel</el-button>
        <el-button  type="primary" @click="importData">Import</el-button>
    </div>

</template>

<script setup lang="ts">

import {ref} from "vue";
import {ElMessage} from "element-plus";
import {useApiClient} from "../services/api.service";
const emit = defineEmits(['imported'])

const props = defineProps<{
    dataSourceAlias: string
}>()

let fileList = ref([])
let replaceExisting = ref(true)
let removeNotExisting= ref(false)
let data = ref(null)

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
    try {
        let res = await api.post(`/datasources/${props.dataSourceAlias}/data/import`, {
            options: {
                replaceExisting: replaceExisting.value,
                removeNotExisting: removeNotExisting.value
            },
            data: data.value
        })
        console.log(res)

        ElMessage.success('Imported')
    } catch (e) {
        ElMessage.error('Import error: ' + e.toString())
    }
}

</script>

<style scoped>

</style>