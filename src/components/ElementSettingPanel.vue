<template>
    <div v-if="properties && fields" class="panel">
        Settings
        <el-form label-position="top" ref="pageForm" :model="properties" size="small">
            <el-form-item v-for="(field, idx)  in fields"
                          :tabindex="idx"
                          :show-message="false"
                          :label="field.title"
                          :required="field.required || false"
                          :prop="field.alias">
                <el-input  :model-value="properties[field.alias]"/>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup lang="ts">

import {ref} from "vue";
import {FieldConfigInterface} from "../model/field";

let pageForm = ref(null)

const props = defineProps<{
    properties: any,
    fields: FieldConfigInterface[]
}>()

// watch(() => props.element,
//     async () => {
//         console.log(props.element)
//     },
//     {
//         deep: true
//     })

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