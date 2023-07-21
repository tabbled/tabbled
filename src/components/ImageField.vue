<template>

    <el-upload  v-if="!fieldConfig.isMultiple"
                :show-file-list="false"
                class="avatar-uploader"
               :action="actionUrl"
               :on-success="uploaded"
               :on-error="handleError"
               :on-remove="handleRemove"
               list-type="picture"
    >
        <div v-if="imageUrl" class="avatar">
            <el-image  :src="imageUrl"
                       class=""
                       alt=""
                       fit="scale-down"
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

    </el-upload>
    <el-upload  v-else
                class="avatar-uploader"
                :action="actionUrl"
                :on-success="uploaded"
                :on-error="handleError"
                :on-remove="handleRemove"
                list-type="picture-card"
                :file-list="images"
                :on-preview="handlePreview"
    >
    </el-upload>

    <el-dialog v-model="dialogVisible">
        <el-image  :src="previewImageUrl" alt="" fit="cover"/>
    </el-dialog>


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
    height?: number,
    width?: number
}>()

let imageUrl = ref(null)
let previewImageUrl = ref(null)
let actionUrl = ref("")
let type: 'text' | 'textarea' = 'text'
let dialogVisible = ref(false)
let images = ref([])


async function getValue() {
    if (props.fieldConfig.isMultiple) {
        images.value = props.modelValue ? props.modelValue : []
    } else {
        imageUrl.value = props.modelValue
    }
}

onMounted(async () => {
    await getValue()
    actionUrl.value = api.url() + '/pictures'
})

function uploaded(res) {
    if (props.fieldConfig.isMultiple) {
        images.value.push({
            name: res.filename,
            url: `${actionUrl.value}/${res.filename}`
        })
        change(images.value)
    } else {
        change(`${actionUrl.value}/${res.filename}`)
    }

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

const handlePreview: UploadProps['onPreview'] = (file) => {
    dialogVisible.value = true
    previewImageUrl.value = file.url
}

function preview() {
    dialogVisible.value = true
    previewImageUrl.value = imageUrl.value
}

function remove() {

    ElMessageBox.confirm(
        t('confirmDeleteTitle'),
        t('delete'),
        {
            confirmButtonText: t('delete'),
            cancelButtonText: t('cancel'),
            type: 'warning',
        }
    )
        .then(() => {
            imageUrl.value = ""
            change("")
        })
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
    padding-left: 12px;
    padding-right: 12px;
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