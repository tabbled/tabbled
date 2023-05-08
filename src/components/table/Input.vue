<template>
    <el-input
        v-if="field && (field.type === 'text' || field.type === 'string')"
        ref="el"
        class="table-input"
        :model-value="value"
        @mouseenter="handleMouseEnter"
        @input="handleInput"
    />
    <el-input-number
        v-else-if="field && (field.type === 'number')"
        :controls="false"
        :precision="field.precision ? field.precision : 0"
        ref="el"
        class="table-input-number"
        :model-value="Number(value)"
        @mouseenter="handleMouseEnter"
        @input="handleInput"
    />
    <el-select
        ref="el"
        v-else-if="field && (field.type === 'link')  && !field.isTree"
        class="table-select"
        :model-value="value"
        placeholder="Select"
        filterable
        remote
        clearable
        remote-show-suffix
        :remote-method="getLinkData"
        :loading="isLoading"
        @change="handleInput"
    >
        <el-option
            v-for="item in linkData"
            :key="item.id"
            :label="item[displayProp]"
            :value="item.id"
        />
    </el-select>
    <el-tree-select
        ref="el"
        v-else-if="field && (field.type === 'link') && field.isTree"
        class="table-select"
        :model-value="value"
        :data="linkData"
        :render-after-expand="false"
        @check="checkChanged"
        check-strictly
        show-checkbox
        :multiple="field.isMultiple"
        style="order: 0; height: 100%; width: calc(100% - 2px); margin: 1px "
        @change="treeChange"
    >

    </el-tree-select>
    <el-select
        ref="el"
        v-else-if="field && (field.type === 'enum') "
        class="table-select"
        :model-value="value"
        placeholder="Select"
        filterable
        remote
        clearable
        :multiple="field.isMultiple"
        :loading="isLoading"
        @change="handleInput"
    >
        <el-option
            v-for="item in field.values"
            :key="item.key"
            :label="item.title"
            :value="item.key"
        />
    </el-select>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {FieldInterface} from "../../model/field";
import {useDataSourceService} from "../../services/datasource.service";
import {DataSourceInterface} from "../../model/datasource";

interface Props {
    modelValue: any,
    field: FieldInterface
    context: any
}

const props = defineProps<Props>()

let emit = defineEmits(['update:modelValue'])

let el = ref(null)
let isLoading = ref(false)
let linkData = ref([])
let value = ref('')
let isTree = ref(true)
let treeValue = ref()

let displayProp = ref('name')
let dsService = useDataSourceService()
let ds:DataSourceInterface = null

onMounted(async () => {
    if (props.modelValue instanceof Promise) {
        value.value = await props.modelValue
    } else {
        value.value = props.modelValue
    }

    if (props.field && props.field.type === 'link') {

        displayProp.value = props.field.displayProp ? props.field.displayProp : 'name';
        ds = await dsService.getByAlias(props.field.datasource);

        await getLinkData();
    }
})

watch(() => value,
    async () => {
        //console.log('update', value.value)
        emit('update:modelValue', value.value)
    },
    {
        deep: true
    })

function handleMouseEnter() {
    if (el.value)
        el.value.focus()
}

function handleInput(val: any) {
    value.value = val

}

async function getLinkData(query?: string) {
    let fGetList = await props.field.getListFunc()
    if (fGetList) {
        linkData.value = await fGetList.exec(Object.assign({ query: query }, props.context))
        return;
    }

    if (!ds) {
        return
    }

    let opt = {
        filter: [],
        take: 50
    }
    if (query) {
        opt.filter.push({
            key: displayProp.value,
            op: 'like',
            compare: `%${query}%`
        })
    }

    isLoading.value = true
    linkData.value = await ds.getMany(opt)
    isLoading.value = false
}

function checkChanged(node,params) {
    value.value = params.checkedKeys
    emit('update:modelValue', value.value)
}

function treeChange(a) {
    if (!props.field.isMultiple) {
        console.log('treeChange', a)
        value.value = a
        emit('update:modelValue', value.value)
    }
}

</script>

<style lang="scss">

.table-select{
    height: calc(31px - 1px);
    width: 100%;
    margin: 1px;
    padding: 0 !important;

    .select-trigger {
        width: 100%;
    }

    .el-input__wrapper {
        width: 100% !important;
        box-shadow: unset !important;
        border-radius: unset;
        padding-left: 8px;
        padding-right: 8px;
    }
}

.table-input-number {
    height: calc(32px - 2px);
    width: unset !important;
    padding: 0 !important;

    .el-input {
        padding: 0;
        margin: 1px;

        .el-input__wrapper {
            border-radius: unset !important;
            box-shadow: unset !important;

            input {
                font-family: inherit;
            }

        }
    }
}

.table-input {
    margin: 0;
    padding: 0;
    height: calc(32px - 2px);

    .el-input__wrapper {
        border-radius: unset !important;
        box-shadow: unset !important;
        margin: 1px;
        padding-left: 7px;

        input {
            font-family: inherit;
        }

    }
}

</style>