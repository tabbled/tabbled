<template>
    <el-form v-if="helper" class="settings-panel-form" label-position="top" :model="helper.props" size="small" >
        <div class="form-item-group">
            <div class="form-item-group-title">
                General
            </div>
            <el-form-item  v-for="(prop)  in helper.getAliases()"
                           class="settings-panel-form-item"
                           :label="helper.propertiesDef()[prop].title">
                <el-input :model-value="helper.props[prop]" @input="e => onChange(prop, e)"/>

    <!--            <div>{{prop}} - {{ helper.props }}</div>-->
            </el-form-item>
        </div>
    </el-form>
</template>

<script setup lang="ts">

import { onMounted, watch } from "vue";
import { ComponentPropertiesHelper } from "../model/component";

const emit = defineEmits<{
    (e: 'update:property', prop: string, value: any): string
}>()

const props = defineProps<{
    helper: ComponentPropertiesHelper
}>()

let init = () => {
    console.log('init', props.helper)
}

let onChange = (prop, value) => {
    console.log(prop, value)
    emit('update:property', prop, value)
    props.helper.setPropertyValue(prop, value)
}

watch(() => props, () => init(), {deep: true})
onMounted(() => init())


</script>

<style lang="scss">

.settings-panel-form {
    margin-bottom: 8px;
    margin-top: 8px;
}

.form-item-group {
    padding: 0 16px;
}

</style>