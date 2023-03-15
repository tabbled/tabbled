<template>
    <el-upload class="avatar-uploader"
               :show-file-list="false"
               :action="actionUrl"
               :on-success="uploaded"
               :on-error="handleError"
               :on-remove="handleRemove"
    >
        <el-image v-if="imageUrl" :src="imageUrl" class="avatar" alt="" fit="cover"/>
        <el-icon v-else class="avatar-uploader-icon">
            <Icon icon="mdi:plus" width="24"/>
        </el-icon>

        <el-dialog v-model="dialogVisible">

        </el-dialog>
    </el-upload>


</template>

<script setup lang="ts">
import {DataSet} from "../model/dataset";
import {onMounted, ref, watch} from "vue";
import {ElMessage, UploadProps} from "element-plus";

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    modelValue?: string,
    dataSet?: DataSet,
    field?: string,
    context?:any,
}>()

let imageUrl = ref(getValue())
let actionUrl = ref("")
let type: 'text' | 'textarea' = 'text'
let dialogVisible = ref(false)

function getValue():string {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue


    return props.dataSet.current[props.field]
}

onMounted(() => {
    actionUrl.value = url() + '/pictures/upload'
})

function url(port: string = '3000') {
    let _url;
    // @ts-ignore
    const env = import.meta.env.MODE || "production";

    if (env === "development" || localStorage.dev === "dev") {
        _url = location.protocol + '//' + location.hostname + ":" + port;
    } else {
        _url = location.protocol + '//' + location.host;
    }
    return _url
}

function uploaded(res) {
    console.log(res)
    change(url('9000') + '/tabbled/' + res.filename)
}

watch(() => props.dataSet,
    async () => {
        console.log("dataset image")
        //_field = props.dataSet.dataSource.getFieldByAlias(props.field)

        if (props.dataSet.isOpen)
            imageUrl.value = getValue()
    },
    {
        deep: true
    })

function change(val) {
    imageUrl.value = val
    emit('update:modelValue', val)

    if (!props.dataSet || !props.field || props.field == '') {
        console.warn(`DataSet or field haven't set`)
        return;
    }

    props.dataSet.update(props.field, val)
}

const handleError: UploadProps['onError'] = (res) => {
    ElMessage.error(JSON.parse(res.message).message)
}

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
    console.log(uploadFile, uploadFiles)
}

</script>

<style >
.avatar-uploader .avatar {
    width: 120px;
    height: 120px;
    display: block;
}

.avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    text-align: center;
}
</style>