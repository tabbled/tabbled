<template>
    <div v-if="properties && model" class="panel">
        Settings
        <el-form label-position="top" ref="pageForm" :model="model" size="small">
            <el-form-item v-for="(prop, idx)  in properties"
                          style="margin-bottom: 8px;"
                          :tabindex="idx"
                          :show-message="false"
                          :label="prop.type === 'bool' ? '' : prop.title"
                          :required="prop.required || false"
                          :prop="prop.alias">
                <el-input v-if="prop.type === 'string'" :model-value="model[prop.alias]"
                            @input="(val) => onInput(prop.alias, val)"
                />
                <el-input v-else-if="prop.type === 'text'"
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 4 }"
                          :model-value="model[prop.alias]"
                          @input="(val) => onInput(prop.alias, val)"
                />
                <el-checkbox v-else-if="prop.type === 'bool'"
                             :label="prop.title"
                             :model-value="model[prop.alias]"
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

let pageForm = ref(null)


const emit = defineEmits(['update'])
const props = defineProps<{
    model: any,
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
    //console.log(alias, value)
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
}

</style>