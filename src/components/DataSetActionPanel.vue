<template>
    <div>
        <el-button v-if="dataSet && canAdd" type="primary" @click="add" size="small">
            {{t('add')}}
        </el-button>
        <el-button v-if="dataSet && canEdit" @click="edit" size="small">
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
import {onMounted, ref, watch} from "vue"
import {useI18n} from "vue-i18n";

const { t } = useI18n();

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

onMounted(() => {
    console.log('onMounted', props.dataSet)
    if (props.dataSet) {
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
    }

})


function add() {
   props.dataSet.insertRow()
}

function edit() {
    console.log('edit')
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
            props.dataSet.removeBySelectedId()
            props.dataSet.selectedIds = []
            props.dataSet.commit()
        }).catch(() => {})
}

</script>

<style lang="scss">

</style>