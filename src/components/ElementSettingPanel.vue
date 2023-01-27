<template>
    <div v-if="properties && element" class="panel">
        <div class="title">Settings</div>
        <div class="subtitle">{{element.name}}</div>
        <el-divider style="margin-top: 8px; margin-bottom: 8px"/>
        <el-form label-position="top" ref="pageForm" :model="element.properties" size="small">
            <el-form-item v-for="(prop, idx)  in properties"
                          style="margin-bottom: 8px;"
                          :tabindex="idx"
                          :show-message="false"
                          :label="prop.type === 'bool' ? '' : prop.title"
                          :required="prop.required || false"
                          :prop="prop.alias">
                <el-input v-if="prop.type === 'string'"
                          :model-value="getValue(prop, element)"
                          @input="(val) => onInput(prop.alias, val)"
                />
                <el-input v-else-if="prop.type === 'text'"
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 4 }"
                          :model-value="getValue(prop, element)"
                          @input="(val) => onInput(prop.alias, val)"
                />
                <el-checkbox v-else-if="prop.type === 'bool'"
                             :label="prop.title"
                             :model-value="getValue(prop, element)"
                             @change="(val) => onInput(prop.alias, val)"
                />
                <el-select-v2 v-else-if="prop.type === 'dataset'"
                              style="width: 100%"
                              filterable
                              :model-value="getValue(prop, element)"
                              :options="dataSetOptions"
                />
                <HandlerEditor v-else-if="prop.type === 'handler'"
                               :type="getValue(prop, element) ? getValue(prop, element).type : 'script'"
                               :script="getValue(prop, element) ? getValue(prop, element).script : ''"
                               @update="(val) => onInput(prop.alias, val)"
                />
                <div v-else style="color: #c45656">Don't have an element for type "{{prop.type}}"</div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";
import {ElementInterface} from "../model/page";
import {DataSetConfigInterface} from "../model/dataset";
import HandlerEditor from "./HandlerEditor.vue";

let pageForm = ref(null)
let dataSetOptions = ref([])


const emit = defineEmits(['update'])
const props = defineProps<{
    element: ElementInterface,
    properties: FieldConfigInterface[],
    dataSets: DataSetConfigInterface[]
}>()

watch(() => props,
    async () => {
        dataSetOptions.value = props.dataSets.map(item => {
            return {
                value: item.alias,
                label: item.alias
            }
        })
    },
    {
        deep: true
    })

function onInput(alias: string, value: any) {
    emit('update', alias, value)
}

function getValue(prop: FieldConfigInterface, element: ElementInterface) {
    return element.properties[prop.alias]
}

</script>

<style lang="scss">

.border {
    position: absolute;
    width: 1px;
    left: 1px;
    height: 100%;
    z-index: 10;
    background: var(--el-border-color);
}

.panel {
    background: white;
    z-index: 0;
    margin: 16px;

    .title {
        font-size: var(--el-font-size-medium);
    }

    .subtitle {
        margin-top: 4px;
        font-size: var(--el-font-size-small);
    }
}



</style>