<template>
    <div>
        <el-button v-if="dataSet && canAdd" type="primary" @click="add" size="small">
            {{t('add')}}
        </el-button>
        <el-button v-if="dataSet && canEdit && props.dataSet.currentId" @click="edit" size="small">
            {{t('edit')}}
        </el-button>
        <el-button v-if="dataSet && canRemove && props.dataSet.selectedIds.length > 0" @click="remove" size="small">
            {{t('delete')}}
        </el-button>
    </div>
</template>

<script setup lang="ts">
import {DataSet} from "../model/dataset";
import { ElMessageBox } from 'element-plus'
import {onMounted, ref} from "vue"
import {useI18n} from "vue-i18n";
import {CompiledFunc, compileScript} from "../services/compiler"

const { t } = useI18n();

export interface ActionConfig {
    type: "script" | "func",
    script?: string,
    func?: string
}

interface Props {
    dataSet: DataSet,
    context: any,
    allowAdd?: boolean
    allowEdit?: boolean
    allowRemove?: boolean
    onEdit?: ActionConfig
    onAdd?: ActionConfig
    onRemove?: ActionConfig
}

const props = withDefaults(defineProps<Props>(), {
    allowAdd: true,
    allowEdit: true,
    allowRemove: true
})

let canAdd = ref(props.allowAdd)
let canEdit = ref(props.allowEdit)
let canRemove = ref(props.allowRemove)
let actions = ref({
    onEdit: null,
    onAdd: null,
    onRemove: null
})

onMounted(() => {
    init();
})

async function init() {
    actions.value.onAdd = await compileAction(props.onAdd)
    actions.value.onEdit = await compileAction(props.onEdit)
    actions.value.onRemove = await compileAction(props.onRemove)
}

async function compileAction(action) {
    if (!action)
        return null

    try {
        return await compileScript(action.script, 'ctx')
    } catch (e) {
        console.error(e)
        return null
    }
}

async function execAction(action: CompiledFunc) {
    try {
        action.exec(props.context)
    } catch (e) {
        console.error(`Execution error in action`)
        console.error(e);
    }
}

function add() {
    if (actions.value.onAdd) {
        execAction(actions.value.onAdd)
    } else
        props.dataSet.insertRow()
}

function edit() {
    if (actions.value.onEdit) {
        execAction(actions.value.onEdit)
    } else {
        console.log("No action for edit button")
    }
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
            if (actions.value.onRemove) {
                execAction(actions.value.onRemove)
            } else {
                props.dataSet.removeBySelectedId()
                props.dataSet.selectedIds = []
                props.dataSet.commit()
            }
        }).catch(() => {})
}

</script>

<style lang="scss">

</style>