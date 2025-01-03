<template>
    <div v-if="!modelValue" slot="noContent" class="flex flex-col p-4 items-center">
        Dataset is not set
    </div>
    <div v-else class="flex flex-col">
        <div class="w-full ">
            <EditableLabel @change="checkUniqueAlias"  class="p-4 pl-6 pr-6 font-medium border-b" :class="{'input-error': aliasIsNotUnique}" v-model="modelValue.alias"/>
        </div>

        <div class="h-full overflow-auto">
            <div class="flex flex-col p-6 gap-4">
                <div class="flex flex-row  items-start gap-4">
                    <label for="dsInput" class="w-32 flex-none">{{$t('report.dataset.datasource')}}</label>
                    <el-select id="dsInput" v-model="modelValue.datasource" @change="clearFields">
                        <el-option
                            v-for="item in datasources"
                            :key="item.key"
                            :label="item.label"
                            :value="item.key"
                        />
                    </el-select>
                </div>

                <div class="flex flex-row gap-4 items-start group/expr">
                    <div class="flex flex-row w-32 flex-none items-center">
                        <label for="filterByInput" class="w-full">
                            {{$t('report.dataset.filterBy')}}
                        </label>
                        <div @click="modelValue.filterExpression = !modelValue.filterExpression"
                             class="group-hover/expr:visible  rounded w-7 h-7 items-center flex flex-none justify-center opacity-40 hover:opacity-80 hover:bg-blue-50"
                             :class="{'invisible text-gray-400': !modelValue.filterExpression}">
                            <ExpressionIcon :height="16" :width="16"/>
                        </div>

                    </div>

                    <el-input v-if="modelValue.filterExpression" id="filterByInput" type="textarea" v-model="modelValue.filterBy"/>
                    <DatasetFilterEditor v-else></DatasetFilterEditor>
                </div>
                <div class="flex flex-row  items-start gap-4">
                    <label for="fieldInput" class="w-32 flex-none">{{$t('report.dataset.fields')}}</label>
                    <DatasetFieldsEditor v-model="modelValue.fields"
                                         :group-by="modelValue.groupBy"
                                         :datasource-fields="fields"
                                         class="w-full"/>
                </div>
                <div class="flex flex-row  items-start gap-4">
                    <label for="groupByInput" class="w-32 flex-none">{{$t('report.dataset.groupBy')}}</label>
                    <el-select id="groupByInput" multiple v-model="modelValue.groupBy">
                        <el-option v-for="field in fields"
                                   :label="field.title"
                                   :value="field.alias"/>
                    </el-select>
                </div>

                <div class="flex flex-row  items-start gap-4 relative">
                    <label for="sortInput" class="w-32 flex-none">{{$t('report.dataset.sort')}}</label>
                    <DatasetSortEditor v-model="modelValue.sort" :datasource-fields="fields"/>
                </div>

            </div>
        </div>
        <div class="p-4 border-t">
            <el-button size="small" @click="emit('remove')">{{$t('delete')}}</el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditableLabel from "../../../components/editable-label/EditableLabel.vue";
import {DatasetDto} from "./report.dto";
import {useApiClient} from "../../../services/api.service";
import {onMounted, ref, watch} from "vue";
import DatasetFieldsEditor from "./DatasetFieldsEditor.vue";
import DatasetSortEditor from "./DatasetSortEditor.vue";
import ExpressionIcon from "../../../components/icons/expression-icon.vue";
import DatasetFilterEditor from "./DatasetFilterEditor.vue";

let api = useApiClient()

let datasources = ref([])
let fields = ref([])
let aliasIsNotUnique = ref(false)

interface Props {
    modelValue?: DatasetDto,
    propAliases: string[]
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: () => null,
    propAliases: () => []
})

const checkUniqueAlias = () => {
    if (!props.modelValue)
        return

    aliasIsNotUnique.value = props.propAliases.includes(props.modelValue.alias)
}

const clearFields = () => {
    console.log('clearFields')
    props.modelValue.fields = []
    props.modelValue.sort = []
    props.modelValue.filters = []
    props.modelValue.groupBy = []
    props.modelValue.filterBy = ""
}

onMounted(() => {
    getDatasource()
    getFields()
    checkUniqueAlias()
})

watch(() => props.modelValue?.datasource, () => {
    getFields()
})

watch(() => props.modelValue?.alias, () => {
    checkUniqueAlias()
})

const emit = defineEmits(['update:modelValue', 'remove'])

const getDatasource = async () => {
    let res = await api.get('v2/datasource')
    if (res.status !== 200) {
        console.error(res)
        return
    }

    res.data.items.forEach(item => {
        if (item.type === 'internal' || item.type === 'internal-db')
        datasources.value.push({
            key: item.alias,
            label: `${item.title} (${item.alias})`
        })
    })
}

const getFields = async () => {
    fields.value = []

    if (!props.modelValue?.datasource)
        return

    let res = await api.get(`v2/datasource/${props.modelValue.datasource}/fields?nested=true`)
    if (res.status !== 200) {
        console.error(res)
        return
    }

    fields.value = res.data.items
}

</script>

<style scoped>

</style>