<template>
    <el-input
        v-if="field && (field.type === 'text' || field.type === 'string')"
        ref="el"
        class="table-input"
        :model-value="modelValue"
        @mouseenter="handleMouseEnter"
        @input="handleInput"
    />
    <el-input-number
        v-else-if="field && (field.type === 'number')"
        :controls="false"
        :precision="field.precision ? field.precision : 0"
        ref="el"
        class="table-input-number"
        :model-value="modelValue"
        @mouseenter="handleMouseEnter"
        @input="handleInput"
    />
    <el-select
        v-else-if="field && (field.type === 'link')"
        class="table-select"
        :model-value="modelValue"
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
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {FieldConfigInterface} from "../../model/field";
import {useDataSourceService} from "../../services/datasource.service";
import {DataSourceInterface} from "../../model/datasource";

interface Props {
    modelValue: any,
    field: FieldConfigInterface
}

const props = defineProps<Props>()

let emit = defineEmits(['update:modelValue'])

let el = ref(null)
let isLoading = ref(false)
let linkData = ref([])

let displayProp = ref('name')
let dsService = useDataSourceService()
let ds:DataSourceInterface = null

onMounted(() => {
    if (props.field && props.field.type === 'link') {
        displayProp.value = props.field.displayProp ? props.field.displayProp : 'name';
        ds = dsService.getDataSourceByAlias(props.field.datasource);
        getLinkData();
    }
})

function handleMouseEnter() {
    if (el.value)
        el.value.focus()
}

function handleInput(value: any) {
    emit('update:modelValue', value)
}

async function getLinkData() {
    if (!ds) {
        return
    }

    isLoading.value = true
    linkData.value = await ds.getAll()
    isLoading.value = false
}

</script>

<style lang="scss">

.table-select{
    height: calc(31px - 2px);
    margin: 1px;
    padding: 0 !important;

    .el-input__wrapper {
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