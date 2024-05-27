<template>
    <el-upload  v-if="fieldConfig"
                :show-file-list="true"
                style="width: 100%"
                :action="actionUrl"
                :on-success="uploaded"
                :on-error="handleError"
                :on-remove="handleRemove"
                :on-preview="handlePreview"
                list-type="text"
                :multiple="fieldConfig.isMultiple"
                :drag="drag"
                :file-list="files"
                :before-remove="beforeRemove"
                :limit="fieldConfig.isMultiple ? undefined : 1"
    >

        <div v-if="drag" style="flex-direction: column; display: flex; align-self: center; justify-items: center; width: inherit; padding: 0;">

            <Icon  icon="material-symbols:upload" width="24" style="opacity: 0.4; align-self: center; margin-right: 4px"/>
            <div>Drop file here or <em>click to upload</em></div>
        </div>
        <el-button v-if="!drag">
            <Icon  icon="material-symbols:upload" width="24" style="opacity: 0.4; align-self: center; margin-right: 4px"/>
            {{$t('loadFile')}}
        </el-button>
    </el-upload>

</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {ElMessage, ElMessageBox, UploadProps} from "element-plus";
import {FieldConfigInterface} from "../model/field";
import {useApiClient} from "../services/api.service";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits(['update:modelValue', 'change'])
let api = useApiClient()

const props = defineProps<{
    modelValue: any,
    fieldConfig?: FieldConfigInterface,
    field?: string,
    context?:any,
    isMultiple?: boolean
    drag?: boolean
}>()

let actionUrl = ref("")
let files = ref([])


async function getValue() {
    if (!props.fieldConfig)
        return undefined;

    files.value = props.modelValue && Array.isArray(props.modelValue) ? props.modelValue : [];
}

onMounted(async () => {
    await getValue()
    actionUrl.value = api.url() + '/files'
})

function uploaded(res) {
    files.value.push(res.data)
    change(files.value)
}

watch(() => props.modelValue,
    async () => {
        await getValue()
    })

function change(val) {
    emit('update:modelValue', val)
    emit('change', val)
}

const handleError: UploadProps['onError'] = (res) => {
    ElMessage.error(JSON.parse(res.message).message)
}

const beforeRemove: UploadProps['beforeRemove'] = () => {
    return ElMessageBox.confirm(
        t('confirmDeleteTitle'),
        t('delete'),
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    ).then(
        () => true,
        () => false
    )
}

const handleRemove: UploadProps['onRemove'] = async (uploadFile) => {
    let url = uploadFile.response ? uploadFile.response['data'].url : uploadFile.url
    await api.delete(url)

    // It's for because the uploader doesn't remove loaded file from list,
    // so we need to remove that manually
    if (uploadFile.response) {
        let idx = files.value.findIndex((file) => {
            return uploadFile.response['data'].filename === file.filename
        })
        files.value.splice(idx, 1)
    }

    change(files.value)
}

const handlePreview = async (file) => {
    let a = document.createElement("a")
    let data
    try {
        data = await api.get(file.url, {responseType: 'blob'})
    } catch (e) {
        console.error(e)
        ElMessage.error('Error while download file')
        return
    }

    a.href = window.URL.createObjectURL(new Blob([data.data], {type: `${file.contentType}`}));
    a.download = file.name;
    document.body.appendChild(a);
    a.click();

    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(file.url);
    }, 0);
}


</script>

<style >

</style>