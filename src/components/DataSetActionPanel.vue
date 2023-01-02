<template>
    <div>
        <el-button v-if="canAdd" @click="add" size="small">Add</el-button>
        <el-button v-if="canEdit" @click="edit" size="small">Edit</el-button>
        <el-button v-if="canRemove && props.dataSet.selectedIds.length > 0" @click="remove" size="small">Remove</el-button>
    </div>
</template>

<script setup lang="ts">
import {DataSet} from "../model/dataset";
import { ElMessageBox } from 'element-plus'
import {ref, watch} from "vue"

interface Props {
    dataSet: DataSet,
    allowAdd?: boolean
    allowEdit?: boolean
    allowRemove?: boolean
}



const props = withDefaults(defineProps<Props>(), {
    allowAdd: true,
    allowEdit: true,
    allowRemove: true
})

let canAdd = ref(props.allowAdd )
let canEdit = ref(props.allowEdit)
let canRemove = ref(props.allowRemove)

watch(() => props.dataSet.currentId(),
    async () => {
        //console.log('changed')
    },
    {
        deep: true
    })

watch(() => props.dataSet.selectedIds,
    async () => {
        //console.log('changed selected', props.dataSet.selectedIds)

    },
    {
        deep: true
    })

function add() {
   props.dataSet.insertRow()
}

function edit() {
    console.log('edit')
}

function remove() {



    ElMessageBox.confirm(
        'Do you want to remove selected items?',
        'Warning',
        {
            confirmButtonText: 'Remove',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    )
        .then(() => {
            props.dataSet.removeBySelectedId()
            props.dataSet.selectedIds = []
            props.dataSet.commit()
        }).catch(() => {})
}

</script>

<style lang="scss">

</style>