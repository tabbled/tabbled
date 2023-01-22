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
                <el-input v-if="prop.type === 'string'" :model-value="element.properties[prop.alias]"
                            @input="(val) => onInput(prop.alias, val)"
                />
                <el-input v-else-if="prop.type === 'text'"
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 4 }"
                          :model-value="element.properties[prop.alias]"
                          @input="(val) => onInput(prop.alias, val)"
                />
                <el-checkbox v-else-if="prop.type === 'bool'"
                             :label="prop.title"
                             :model-value="element.properties[prop.alias]"
                             @change="(val) => onInput(prop.alias, val)"
                />
                <div v-else style="color: #c45656">Don't have an element for type "{{prop.type}}"</div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {FieldConfigInterface} from "../model/field";
import {ElementInterface} from "../model/page";

let pageForm = ref(null)


const emit = defineEmits(['update'])
const props = defineProps<{
    element: ElementInterface,
    properties: FieldConfigInterface[]
}>()

// watch(() => props.element,
//     async () => {
//         console.log(props.element)
//     },
//     {
//         deep: true
//     })

function onInput(alias: string, value: any) {
    emit('update', alias, value)
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