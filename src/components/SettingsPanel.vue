<template>
    <el-form v-if="pageStore.propertiesHelper" class="settings-panel-form" label-position="top" :model="pageStore.propertiesHelper.props" size="small" >
        <div class="form-item-group">
            <div class="form-item-group-title">
                General
            </div>
            <el-form-item  v-for="(prop)  in pageStore.propertiesHelper.getAliases()"
                           class="settings-panel-form-item"
                           :label="pageStore.propertiesHelper.propertiesDef()[prop].title">
                <el-input size="small" :model-value="pageStore.propertiesHelper.props[prop]" @input="e => onChange(prop, e)"/>

    <!--            <div>{{prop}} - {{ helper.props }}</div>-->
            </el-form-item>
        </div>
    </el-form>
</template>

<script setup lang="ts">

import { onMounted } from "vue";
import {usePage} from "../store/pageStore";

const emit = defineEmits<{
    (e: 'update:property', prop: string, value: any): string
}>()

let pageStore = usePage()

// const props = defineProps<{
//     helper: ComponentPropertiesHelper
// }>()

pageStore.$onAction(
    ({
         name, // name of the action
         store, // store instance, same as `someStore`
         args, // array of parameters passed to the action
         after, // hook after the action returns or resolves
         onError, // hook if the action throws or rejects
     }) => {


        after((result) => {
            if (name === 'openSettings')
                init()
            console.log('after', name)
            console.log()
        })
    })

let init = () => {
    console.log('init', pageStore.propertiesHelper)
}

let onChange = (prop, value) => {
    pageStore.setProperty(prop, value)
}

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