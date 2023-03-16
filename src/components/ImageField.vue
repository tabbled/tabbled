<template>

    <el-upload class="avatar-uploader"
               :show-file-list="false"
               :action="actionUrl"
               :on-success="uploaded"
               :on-error="handleError"
               :on-remove="handleRemove"
    >
        <div v-if="imageUrl" class="avatar">
            <el-image  :src="imageUrl" class="" alt="" fit="cover"/>

            <el-icon class="image-field-actions">
                <div class="image-field-action-icon" @click.stop="preview" >
                    <Icon  icon="ic:baseline-zoom-in" width="48"/>
                </div>
                <div class="image-field-action-icon" @click.stop="remove">
                    <Icon icon="mdi:delete" width="90"/>
                </div>

            </el-icon>
        </div>

        <el-icon v-else class="avatar-uploader-icon">
            <Icon  icon="mdi:plus" width="24"/>
        </el-icon>

        <el-dialog v-model="dialogVisible">
            <el-image  :src="imageUrl" alt="" fit="cover"/>
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
    actionUrl.value = url()
})

function url(port: string = '3000') {
    let _url;
    // @ts-ignore
    const env = import.meta.env.MODE || "production";

    console.log(location)
    if (env === "development" || localStorage.dev === "dev") {
        _url = location.protocol + '//' + location.hostname + ":" + port;
    } else {
        _url = location.protocol + '//api.' + location.host;
    }
    return _url + '/pictures'
}

function uploaded(res) {
    change(`${url()}/${res.filename}`)
}

watch(() => props.dataSet,
    async () => {

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

function preview() {
    dialogVisible.value = true
}

function remove() {
    imageUrl.value = ""
    change("")
}

</script>

<style >
.avatar-uploader .avatar {
    width: 120px;
    height: 120px;
    display: flex;
    justify-content: center;
}

.image-field-actions {
    display: flex;
    position: absolute;
    align-self: center;
    background: transparent;
    width: 100%;
    height: 100%;
}
.image-field-actions:hover {
    background: rgba(0,0,0,0.4);
}

.image-field-action-icon {
    display: block;
    color: var(--el-border-color);
    font-size: 20px;
    padding-left: 8px;
    opacity: 0;
}

.image-field-actions:hover .image-field-action-icon{
    opacity: 1;
}

.image-field-action-icon:hover {
    color: var(--el-border-color-extra-light);
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
    color: #c45656;
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    text-align: center;
}
</style>