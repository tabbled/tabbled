<template>
    <div v-if="field">

        <div v-if="field.isMultiple">
            <el-tag v-for="item in displayValue" style="margin-right: 4px">
                {{item}}
            </el-tag>
        </div>
        <div v-else>
            {{displayValue}}
        </div>
    </div>

</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {FieldInterface} from "../../model/field";
import {useDataSourceService} from "../../services/datasource.service";
import {DataSourceInterface} from "../../model/datasource";

interface Props {
    modelValue: any | Promise<any>,
    field: FieldInterface,
    context?:any
}

const props = defineProps<Props>()

let isLoading = ref(false)

let displayProp = ref('name')
let dsService = useDataSourceService()
let ds:DataSourceInterface = null
let displayValue = ref("")

onMounted(async () => {
    await getData()
})

watch(() => props.modelValue,
    async () => {
        //console.log('update', props.modelValue)
        await getData()
    },
    {
        deep: true
    })

async function getData() {
    displayValue.value = ""
    if (!props.field) {
        return
    }


    if (props.field.config.getValue) {
        try {
            displayValue.value  = await getValueFunc()
            return;
        } catch (e) {
            displayValue.value = 'Error'
            console.error(e)
            return;
        }
    }

    switch(props.field.type) {
        case "text":
        case "string": displayValue.value = props.modelValue; break;
        case "enum": await getEnumValue(); break;
        case "link": await getLinkValue(); break;
        case "number": displayValue.value = formatNumber(props.modelValue, props.field.precision); break;
        default: displayValue.value = 'Error'
    }
}

function formatNumber(value: any, precision: number) {
    if (value === undefined || value === null || value === "")
        return "";

    return Number.parseFloat(Number(value).toFixed(precision)).toLocaleString('ru-RU')
}

async function getLinkValue() {

    if (props.field.config.getValue) {
        displayValue.value = await props.modelValue
        return;
    }

    displayProp.value = props.field.displayProp ? props.field.displayProp : 'name';
    ds = dsService.getDataSourceByAlias(props.field.datasource);

    if (!ds) {
        console.warn(`DataSource for link data for field "${props.field.alias}" doesn't set`)
        displayValue.value = ""
        return;
    }

    isLoading.value = true

    if (props.field.isMultiple) {
        displayValue.value = props.modelValue
    } else {
        let val = props.modelValue
        let link_entity = await ds.getById(val)
        if (!link_entity)
            return 'not found'

        displayValue.value = link_entity[props.field.displayProp ? props.field.displayProp : 'name']
    }

    isLoading.value = false
}

async function getEnumValue() {
    const items = props.field.values;
    let val = await props.modelValue
    for(const i in items) {
        if (items[i].key === val) {
            displayValue.value = items[i].title
            return
        }
    }
    displayValue.value = 'Not found'
}



async function getValueFunc() {

    let getValueFunc = await props.field.getValueFunc()

    if (getValueFunc) {
        try {
            return await getValueFunc.exec(props.context)
        } catch (e) {
            console.error(`Error while evaluating field ${props.field.alias} getValue function `)
            console.error(e)
            return null
        }
    }
    return null;
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