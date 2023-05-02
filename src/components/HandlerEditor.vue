<template>
    <CodeEditor v-if="modelValue && modelValue.type === 'script'"
                :model-value="getScript()"
                @update:model-value="onCodeUpdate"
                runnable
                style="width: 100%;"
    />
    <el-select v-if="modelValue && modelValue.type ==='function'"
        filterable
        v-model="modelValue.functionId"
    >
        <el-option
            v-for="item in functions"
            :label="item.label"
            :value="item.key"

        />
    </el-select>
</template>

<script setup lang="ts">

import CodeEditor from "./CodeEditor.vue";
import {HandlerInterface} from "../model/handler";
import {onMounted, ref} from "vue";
import {useDataSourceService} from "../services/datasource.service";

let dsService = useDataSourceService()

interface ListItem {key: string, label: string}
const functions = ref<Array<ListItem>>([])

interface Props  {
    modelValue: HandlerInterface
}

const props = withDefaults(defineProps<Props>(), {
})

let emit = defineEmits(['update'])

onMounted(async() => {
    let ds = dsService.functionDataSource
    let data = await ds.getAll()
    data.forEach(ds => {
        functions.value.push({
            key: ds.id,
            label: ds.title
        })
    })
})

function onCodeUpdate(code: string) {
    emit('update', {
        type: props.modelValue.type ? props.modelValue.type : 'script',
        script: code
    })
}

function getScript() {
    return props.modelValue.script
}



</script>

<style scoped>

</style>