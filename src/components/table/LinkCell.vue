<template>
    {{displayValue}}
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

let isLoading = ref(false)

let displayProp = ref('name')
let dsService = useDataSourceService()
let ds:DataSourceInterface = null
let displayValue = ref("")

onMounted(() => {
    if (!props.field || !props.modelValue) {
        return
    }

    if (props.field.type === 'link') {
        displayProp.value = props.field.displayProp ? props.field.displayProp : 'name';
        ds = dsService.getDataSourceByAlias(props.field.datasource);
        getLinkValue();
    } else if (props.field.type === 'enum') {
        getEnumValue();
    }
})

async function getLinkValue() {
    if (!ds) {
        displayValue.value = ""
        return
    }

    isLoading.value = true

    let link_entity = await ds.getById(props.modelValue)
    if (!link_entity)
        return 'not found'

    displayValue.value = link_entity[props.field.displayProp ? props.field.displayProp : 'name']
    isLoading.value = false
}

function getEnumValue() {
    const items = props.field.values;
    for(const i in items) {
        if (items[i].key === props.modelValue) {
            displayValue.value = items[i].title
            return
        }
    }
    displayValue.value = 'Not found'
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