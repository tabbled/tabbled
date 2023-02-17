<template>

    <el-card
        shadow="never"
        class="editor">

        <div v-if="header !== ''"  style="padding: 8px">{{ header }}</div>
        <el-divider v-if="header !== ''" style="padding: 0; margin: 0"/>

    <Codemirror
        :model-value="script"
        placeholder="Code goes here..."
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="4"
        :extensions="extensions"
        @ready="handleReady"
        @change="log('change', $event)"
        @focus="log('focus', $event)"
        @blur="log('blur', $event)"
    />
        <el-divider style="padding: 0; margin: 0"/>
        <el-row justify="end">
            <el-divider style="padding: 0; margin: 0; height: inherit" direction="vertical"/>
            <el-button text type="primary" style="border-radius: 0" @click="runScript">
                <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                Run
            </el-button>
        </el-row>


    </el-card>

</template>

<script setup lang="ts">

import {ref, shallowRef, watch} from "vue";
import {Codemirror} from 'vue-codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {DataSet} from "../model/dataset";
import {CompiledFunc, compileScript} from "../services/compiler";

const props = defineProps<{
    modelValue?: string,
    dataSet?: DataSet,
    field?: string,
    context?:any,
}>()

const emit = defineEmits(['update:modelValue', 'change'])
const extensions = [javascript()]

const view = shallowRef()
let script = ref(getScript())
let header = ref('')
const handleReady = (payload) => {
    view.value = payload.view
}

function getScript():string {
    if (!props.dataSet || !props.field || props.field === '' || !props.dataSet.current)
        return props.modelValue

    return props.dataSet.current[props.field]
}


watch(() => props.dataSet,
    async () => {
        if (props.dataSet && props.field && props.field !== '') {
            header.value = props.dataSet.dataSource.getFieldByAlias(props.field).title
            console.log(header.value)
        }

        if (props.dataSet.isOpen)
            script.value = getScript()
    },
    {
        deep: true
    })

// console.log(props.dataSet)
// console.log(props.field)


// Status is available at all times via Codemirror EditorView
// function getCodemirrorStates() {
//     const state = view.value.state
//     const ranges = state.selection.ranges
//     const selected = ranges.reduce((r, range) => r + range.to - range.from, 0)
//     const cursor = ranges[0].anchor
//     const length = state.doc.length
//     const lines = state.doc.lines
//     // more state info ...
//     // return ...
// }

function log(type:string, event: any) {
    if (type === 'change') {
        script.value = event
        emit('update:modelValue', event)


        if (!props.dataSet || !props.field || props.field == '') {
            console.warn(`DataSet or field haven't set`)
            return;
        }

        props.dataSet.update(props.field, event)
    }
}

async function runScript() {
    let func: CompiledFunc
    try {
        func = await compileScript(script.value, 'ctx')
        func.exec(props.context)
    }catch (e) {
        console.error(e)
    }
}

</script>

<style lang="scss">

.editor {
    text-align: left;
    width: 100%;
    .el-card__body {
        padding: 0;
    }
    .cm-content {
        padding-bottom: 8px;
        padding-top: 8px;
    }
}

</style>