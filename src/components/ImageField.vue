<template>

    <el-upload class="avatar-uploader"
               :show-file-list="false"
               дш
               :action="actionUrl"
               :on-success="uploaded"
               :on-error="handleError"
               :on-remove="handleRemove"
    >
        <div v-if="imageUrl" class="avatar">
            <el-image  :src="imageUrl"
                       class=""
                       alt=""
                       fit="cover"
                       :style="{ width: width + 'px', height: height + 'px' }"/>

            <el-icon class="image-field-actions">
                <div class="image-field-action-icon" @click.stop="preview" >
                    <Icon  icon="ic:baseline-zoom-in" width="48"/>
                </div>
                <div class="image-field-action-icon" @click.stop="remove">
                    <Icon icon="mdi:delete" width="90"/>
                </div>

            </el-icon>
        </div>

        <el-icon v-else class="avatar-uploader-icon"
                 :style="{ width: width + 'px', height: height + 'px' }">
            <Icon  icon="mdi:plus" width="24"/>
        </el-icon>

        <el-dialog v-model="dialogVisible">
            <el-image  :src="imageUrl" alt="" fit="cover"/>
        </el-dialog>

    </el-upload>

</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {ElMessage, UploadProps} from "element-plus";
import {FieldConfigInterface} from "../model/field";
import {useApiClient} from "../services/api.service";

const emit = defineEmits(['update:modelValue', 'change'])
let api = useApiClient()

const props = defineProps<{
    modelValue: any,
    fieldConfig?: FieldConfigInterface,
    field?: string,
    context?:any,
    height?: number,
    width?: number
}>()

let imageUrl = ref(null)
let actionUrl = ref("")
let type: 'text' | 'textarea' = 'text'
let dialogVisible = ref(false)


async function getValue() {
    imageUrl.value = props.modelValue
}

onMounted(async () => {
    await getValue()
    actionUrl.value = api.url() + '/pictures'
})

function uploaded(res) {
    change(`${actionUrl.value}/${res.filename}`)
}

watch(() => props.modelValue,
    async () => {
        await getValue()
    })

function change(val) {
    imageUrl.value = val
    emit('update:modelValue', val)
    emit('change', val)
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
    text-align: center;
}
</style>