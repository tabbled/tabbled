<template>
    <div v-if="field">
        <el-checkbox v-if="field.type==='bool'"
                     :model-value='displayValue'
                     style="padding-left: 8px"
        />

        <div v-else-if="field.isMultiple">
            <el-tag v-for="item in displayValue" style="margin-right: 4px">
                {{item}}
            </el-tag>
        </div>
        <div v-else :class="{ 'wordwrap': column && column.wordwrap }">
            {{displayValue}}
        </div>
    </div>

</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {FieldInterface} from "../../model/field";

interface Props {
    modelValue: Promise<any>,
    field: FieldInterface,
    column: any

}

const props = defineProps<Props>()

let isLoading = ref(false)

let displayValue = ref("")

onMounted(() => {
    getData()
})

watch(() => props.modelValue,
    () => {
        getData()
    },
    {
        deep: true
    })

function getData() {
    displayValue.value = ""
    props.modelValue.then(val => {
        displayValue.value = val
    }).catch(e => {
        console.error(e)
        displayValue.value = "Error"
    })
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

.wordwrap {
    white-space: normal;
}

</style>