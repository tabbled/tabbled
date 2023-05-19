<template>

    <el-card
        shadow="never"
        class="editor">

<!--        <div v-if="header !== ''"  style="padding: 8px">{{ header }}</div>-->
<!--        <el-divider v-if="header !== ''" style="padding: 0; margin: 0"/>-->

    <Codemirror
        :model-value="script"
        placeholder="Code goes here..."
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="4"
        :extensions="extensions"
        :style="{'max-height': maxHeight + 'px'}"

        @ready="handleReady"
        @change="change($event)"
    />
        <el-divider v-if="runnable" style="padding: 0; margin: 0"/>
        <el-row v-if="runnable" justify="end">
            <el-divider style="padding: 0; margin: 0; height: inherit" direction="vertical"/>
            <el-button text type="primary" style="border-radius: 0" @click="runScript">
                <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                Run
            </el-button>
        </el-row>


    </el-card>

</template>

<script setup lang="ts">

import {onMounted, ref, shallowRef, watch} from "vue";
import {Codemirror} from 'vue-codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {json} from '@codemirror/lang-json'
import {html} from '@codemirror/lang-html'
import {CompiledFunc, compileScript} from "../services/compiler";
import {FieldConfigInterface} from "../model/field";

interface Props {
    modelValue?: any,
    field?: string,
    fieldConfig?: FieldConfigInterface,
    context?:any,
    format: 'json' | 'javascript' | 'html',
    runnable: boolean,
    maxHeight: number
    update?: number
    load?: Promise<any>
}

const props = withDefaults(defineProps<Props>(), {
    format: "javascript",
    runnable: false,
    maxHeight: 400
})

const emit = defineEmits(['update:modelValue', 'change'])
const extensions = ref<Array<any>>([javascript()])

const view = shallowRef()
let script = ref("")
let header = ref('')
const handleReady = (payload) => {
    view.value = payload.view
}

async function getScript() {
    script.value = props.modelValue
    //console.log()
}

watch(() => props.update,
    async () => {
        if (props.load)
            script.value = await props.load
    }, {
        deep: true
    })

onMounted(async () => {
    await getScript()
    setExtensions()
});


watch(() => props.format,
    async () => {
        await setExtensions()
    })

watch(() => props.modelValue,
    async () => {
        await getScript()
    }, {deep: true})

function setExtensions() {
    let arr = []
    if (props.format === 'json')
        arr.push(json())
    if (props.format === 'javascript')
        arr.push(javascript())
    if (props.format === 'html')
        arr.push(html())

    extensions.value = arr
}

function change(event: any) {
    script.value = event
    emit('update:modelValue', event)
    emit('change', event)
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