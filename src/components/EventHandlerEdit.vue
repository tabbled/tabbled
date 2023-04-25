<template>
    <el-form ref="formRef" :model="modelValue" label-width="100px">

        <el-form-item label="Event">
            <el-select
                       filterable
                       v-model="modelValue.event"
            >
                <el-option
                    v-for="item in events"
                    :label="item.label"
                    :value="item.key"
                    
                />
            </el-select>
        </el-form-item>

        <el-form-item label="Handler">
            <HandlerEditor v-model="modelValue.handler"/>
        </el-form-item>


    </el-form>

</template>

<script setup lang="ts">

import {useI18n} from "vue-i18n";
import {onMounted, ref} from "vue";
import {useDataSourceService} from "../services/datasource.service";
import {EventHandlerInterface} from "../model/eventHandler";
import HandlerEditor from "./HandlerEditor.vue";

const { t } = useI18n();

interface ListItem {key: string, label: string}

const events = ref<Array<ListItem>>([])
const dataSources = ref<Array<ListItem>>([])


let dsService = useDataSourceService()

onMounted(async () => {
    events.value = [
        {key: 'onAdd', label: "onAdd"},
        {key: 'onUpdate', label: "onUpdate"},
        {key: 'onRemove', label: "onRemove"}
    ]
});

const props = defineProps<{
    modelValue: EventHandlerInterface
}>()

const emit = defineEmits(['update:modelValue'])

</script>

<style scoped>

</style>