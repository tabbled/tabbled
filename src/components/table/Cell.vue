<template>
    {{displayValue}}
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {FieldConfigInterface} from "../../model/field";
import {useDataSourceService} from "../../services/datasource.service";
import {DataSourceInterface} from "../../model/datasource";

interface Props {
    modelValue: Promise<any>,
    field: FieldConfigInterface
}

const props = defineProps<Props>()

let isLoading = ref(false)

let displayProp = ref('name')
let dsService = useDataSourceService()
let ds:DataSourceInterface = null
let displayValue = ref("")

onMounted(async () => {
    if (!props.field || !props.modelValue) {
        return
    }

    isLoading.value = true

    let val = null

    try {
        val = await props.modelValue
    } catch (e) {
        displayValue.value = 'Error'
        console.error(e)
    }

    switch(props.field.type) {
        case "text":
        case "string":
        case "enum":
        case "link": displayValue.value = val; break;
        case "number": displayValue.value = formatNumber(val, props.field.precision); break;
        default: displayValue.value = 'Error'
    }
    isLoading.value = false

})

function formatNumber(value: any, precision: number) {
    if (value === undefined || value === null || value === "")
        return "";

    return Number.parseFloat(Number(value).toFixed(precision)).toLocaleString('ru-RU')
}

</script>

<style lang="scss">

.table-select{

    margin: 1px;

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