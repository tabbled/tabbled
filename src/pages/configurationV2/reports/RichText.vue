<template>
    <div v-if="editor" class="flex flex-col">

        <div class="flex flex-row mb-2 gap-1 items-center flex-wrap" v-if="!readonly">
            <el-button title="Bold" class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleBold().run()">
                <BoldIcon :width="18" :height="18"/>
            </el-button>
            <el-button title="Italic" class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleItalic().run()">
                <ItalicIcon :width="18" :height="18"/>
            </el-button>
            <el-button title="Strike" class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleStrike().run()">
                <StrikeIcon :width="18" :height="18"/>
            </el-button>
            <el-button title="Underline" class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleUnderline().run()">
                <UnderlineIcon :width="18" :height="18"/>
            </el-button>

            <el-button title="Bullet list" class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleBulletList().run()">
                <BulletListIcon :width="18" :height="18"/>
            </el-button>
            <el-button title="Ordered list" class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleOrderedList().run()">
                <NumberedListIcon :width="18" :height="18"/>
            </el-button>

            <el-popover
                placement="bottom-start"
                :width="24"
                trigger="click"
            >
                <template #reference>
                    <el-button title="Highlight" class="editor-panel-button" size="small" text>
                        <HighlighterIcon :width="18" :height="18"/>
                    </el-button>
                </template>
                <div class="color-selector-element"
                     v-for="color in predefineColors"
                     :style="{'background': color}"
                     @click="editor.chain().focus().toggleHighlight({ color: color }).run()"
                     :class="{ 'is-active': editor.isActive('highlight', { color: color }) }"

                />
            </el-popover>

            <el-popover
                placement="bottom-start"
                :width="24"
                trigger="click"
            >
                <template #reference>
                    <el-button title="Color" class="editor-panel-button" size="small" text>
                        <TextColorIcon :width="18" :height="18"/>
                    </el-button>
                </template>
                <div class="color-selector-element"
                     v-for="color in predefineColors"
                     :style="{'background': color}"
                     @click="editor.chain().focus().setColor(color).run()"
                />
            </el-popover>

            <el-popover
                placement="bottom-start"
                :width="40"
                trigger="click"
            >
                <template #reference>
                    <el-button title="Format" class="editor-panel-button" size="small" text>
                        <HeaderTextIcon :width="24" :height="24"/>
                    </el-button>
                </template>
                <div style="cursor: pointer; margin: 4px"
                     v-for="h in predefinedHeaders"
                     @click="editor.chain().focus().toggleHeading({level: h}).run()"
                >
                    H{{h}}
                </div>
            </el-popover>

            <div class="border-r w-1 h-4/5 mr-2"/>
            <el-button size="small"
                       class="editor-panel-button"
                       text
                       title="Insert table"
                       @click="insertTable()"
            >
                <AddTableIcon :width="18" :height="18"/>
            </el-button>
            <el-button  v-if="editor.can().addRowAfter()"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Add row after"
                        @click="editor.chain().focus().addRowAfter().run()"
            >
                <AddRowAfterIcon :width="18" :height="18"/>
            </el-button>
            <el-button  v-if="editor.can().addRowBefore()"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Add row before"
                        @click="editor.chain().focus().addRowBefore().run()"
            >
                <AddRowBeforeIcon :width="18" :height="18"/>
            </el-button>
            <el-button  v-if="editor.can().deleteRow()"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Remove row"
                        @click="editor.chain().focus().deleteRow().run()"
            >
                <RemoveRowIcon :width="18" :height="18"/>
            </el-button>

            <el-button  v-if="editor.can().addColumnAfter()"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Add column after"
                        @click="editor.chain().focus().addColumnAfter().run()"
            >
                <AddColumnAfterIcon :width="18" :height="18"/>
            </el-button>
            <el-button  v-if="editor.can().addColumnBefore()"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Add column before"
                        @click="editor.chain().focus().addColumnBefore().run()"
            >
                <AddColumnBeforeIcon :width="18" :height="18"/>
            </el-button>




            <el-button  v-if="editor.can().deleteTable()"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Remove table"
                        @click="editor.chain().focus().deleteTable().run()"
            >
                <RemoveTableIcon :width="18" :height="18"/>
            </el-button>

            <el-popover
                placement="bottom-start"
                trigger="click"

            >
                <template #reference>
                    <el-button  v-if="editor.isActive('table')"
                                size="small"
                                class="editor-panel-button"
                                text
                                title="Link dataset or array to table"
                                @click="getDatasetsMenu"
                    >
                        <DatasetLinkIcon :width="18" :height="18"/>
                    </el-button>
                </template>

                    <List :items="datasetsMenu" key-prop="id"
                          :current-key="editor.getAttributes('table').dataset"
                          title-prop="label"
                          @clicked="(idx) => editor.chain().focus().updateAttributes('table', { dataset: datasetsMenu[idx].id}).run()"
                    />
            </el-popover>

            <el-button  v-if="editor.isActive('table')"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Link dataset to table"
            >
                <DatasetLinkIcon :width="18" :height="18"/>
            </el-button>

            <el-button  v-if="editor.can().mergeOrSplit()"
                        size="small"
                        class="editor-panel-button"
                        text
                        title="Merge or split cell"
                        @click="editor.chain().focus().mergeOrSplit().run()"
            >
                <MergeCellIcon v-if="editor.can().mergeCells()" :width="18" :height="18"/>
                <SplitCellIcon v-if="editor.can().splitCell()" :width="18" :height="18"/>
            </el-button>

            <el-button  size="small"
                        class="editor-panel-button"
                        text
                        title="Insert parameter"
                        @click="editor.chain().addParameter().focus().run()"
            >
                <ParameterIcon :width="22" :height="22"/>
            </el-button>
        </div>
        <editor-content class="h-full overflow-hidden focus:ring-sky-300 border rounded focus:outline-none hover:ring-gray-100" :class="{ editable: !readonly }" :editor="editor"/>
    </div>

</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import {NodePos} from "@tiptap/core";
import {Underline} from "@tiptap/extension-underline";
import {Color} from "@tiptap/extension-color";
import {TextStyle} from "@tiptap/extension-text-style";
import {Highlight} from "@tiptap/extension-highlight";
import {DatasetTable} from "./table-extension"
import { Level } from "@tiptap/extension-heading";
import ParameterExtension from "./parameter-extension"
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import AddTableIcon from "../../../components/icons/add-table-icon.vue";
import BoldIcon from "../../../components/icons/bold-icon.vue";
import ItalicIcon from "../../../components/icons/italic-icon.vue";
import StrikeIcon from "../../../components/icons/strike-icon.vue";
import UnderlineIcon from "../../../components/icons/underline-icon.vue";
import BulletListIcon from "../../../components/icons/bullet-list-icon.vue";
import NumberedListIcon from "../../../components/icons/numbered-list-icon.vue";
import HighlighterIcon from "../../../components/icons/highlighter-icon.vue";
import TextColorIcon from "../../../components/icons/text-color-icon.vue";
import HeaderTextIcon from "../../../components/icons/header-text-icon.vue";
import AddRowAfterIcon from "../../../components/icons/add-row-after-icon.vue";
import AddRowBeforeIcon from "../../../components/icons/add-row-before-icon.vue";
import RemoveRowIcon from "../../../components/icons/remove-row-icon.vue";
import AddColumnAfterIcon from "../../../components/icons/add-column-after-icon.vue";
import AddColumnBeforeIcon from "../../../components/icons/add-column-before-icon.vue";
import RemoveTableIcon from "../../../components/icons/remove-table-icon.vue";
import MergeCellIcon from "../../../components/icons/merge-cell-icon.vue";
import SplitCellIcon from "../../../components/icons/split-cell-icon.vue";
import DatasetLinkIcon from "../../../components/icons/dataset-link-icon.vue";
import {ContextParameter, DatasetDto, ReportParameterDto} from "./report.dto";
import List from "../../../components/list/List.vue";
import ParameterIcon from "../../../components/icons/parameter-icon.vue";

let editor = ref<Editor>()

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    id?: string
    modelValue?: any
    autosize?: boolean
    disabled?: boolean
    readonly?: boolean
    datasets: DatasetDto[]
    params: ReportParameterDto[]
    contextParameters: (path?: string) => Promise<ContextParameter[]>
}>()

let value = ref<string | Array<string>>()

const predefineColors = ref([
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
])

const predefinedHeaders = ref<Level[]>([1,2,3,4,5,6])
const datasetsMenu = ref<any>([])

onMounted(async () => {
    init()
    await getValue()
})

onBeforeUnmount(() => {
    editor.value.destroy()
})

async function getValue() {
    value.value = props.modelValue
}

function init() {
    editor.value = new Editor({
        extensions: [
            StarterKit,
            Underline,
            Color,
            TextStyle,
            Highlight.configure({ multicolor: true }),
            TableRow,
            TableHeader,
            TableCell,
            DatasetTable.configure({
                resizable: true
            }),
            ParameterExtension.configure({
                getContext: () => {
                    console.log('invoke method')
                }
            })
        ],
        content: props.modelValue,
        onUpdate: () => {
            change(editor.value.getHTML())
            console.log(editor.value.getHTML())
        },
        onSelectionUpdate: () => {
            //console.log(editor.value.isActive('table'))
        },
        editable: !props.disabled && !props.readonly
    })

    editor.value['getContext'] = (element) => {
        return getContext(element)
    }
}

const getCurrentDataset = () => {

    let attr = editor.value.getAttributes('table')
    console.log(attr)
}

const change = (val) => {
    value.value = val
    emit('update:modelValue', val)
    emit('change', val)
}

const insertTable = () => {
    editor.value.chain().focus().insertTable({ rows: 2, cols: 3, withHeaderRow: true }).run()
}

const getContext = async (el) => {

    // We have to find a parent node, and
    // if it's a table, then get dataset and show fields only from that
    let res = editor.value.$doc.node.resolve(el.getPos())
    let pos = new NodePos(res, el.editor)
    const table = pos.closest('table')
    let dataset = null
    if (table && table.attributes.dataset) {
        dataset = table.attributes.dataset
    }

    return await props.contextParameters(dataset ? dataset : null)
}

const getDatasetsMenu = async() => {
    let params = await props.contextParameters(null)
    let d = params.filter(f => f.dataType === 'array')
console.log(d)
    datasetsMenu.value = d
}

</script>

<style lang="scss">

.editable .tiptap{
    //box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color));
    outline-color: var(--el-color-primary);
}

.tiptap {
    background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
    font-family: "Roboto", serif;
    padding: 16px;
    height: inherit;
    overflow: auto;
    //position: absolute;

    table {
        z-index: 0;
        .selectedCell:after {
            background-color: (var(--el-color-primary));
            opacity: 0.2;
            content: "";
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 0;
        }

        .column-resize-handle {
            background-color: rgb(203 213 225);
            bottom: -2px;
            position: absolute;
            right: -2px;
            top: 0;
            width: 4px;
            cursor: col-resize;
        }

        .tableWrapper {
            margin: 1.5rem 0;
            overflow-x: auto;
        }
    }

    > * + * {
        margin-top: 0.2em;
    }

    line-height: 24px;

    p {
        padding-top: 0;
        padding-bottom: 0;
        margin-block-start: 0;
        margin-block-end: 0;
    }

    ul,
    ol {
        padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
        line-height: 1.1;
    }

    h1 { font-size: 2.00rem; }
    h2 { font-size: 1.74rem; }
    h3 { font-size: 1.52rem; }
    h4 { font-size: 1.32rem; }
    h5 { font-size: 1.15rem; }
    h6 { font-size: 1.00rem; }

    code {
        background-color: gray;
        color: #616161;
    }

    pre {
        background: #0D0D0D;
        color: #FFF;
        font-family: 'JetBrainsMono', monospace;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;

        code {
            color: inherit;
            padding: 0;
            background: none;
            font-size: 0.8rem;
        }
    }

    img {
        max-width: 100%;
        height: auto;
    }

    blockquote {
        padding-left: 1rem;
        border-left: 2px solid gray;
    }

    hr {
        border: none;
        border-top: 2px solid gray;
        margin: 2rem 0;
    }

    mark {
        background-color: #ffe066;
        padding: 0.125em 0;
        border-radius: 0.25em;
        box-decoration-break: clone;
    }

    .param {
        background: var(--el-color-primary-light-3);
        border: 1px dashed black;
        border-radius: 4px;
        box-decoration-break: clone;
        color: var(--purple);
        padding: 0.1rem 0.3rem;
    }

    table {
        border-collapse: collapse;
        margin: 0;
        overflow: hidden;
        table-layout: fixed;

        td,
        th {
            border: 1px solid rgb(203 213 225);
            box-sizing: border-box;
            min-width: 1em;
            padding: 6px 8px;
            position: relative;
            vertical-align: top;

            > * {
                margin-bottom: 0;
            }
        }

        th {
            background-color: rgb(248 250 252);
            font-weight: bold;
            text-align: left;
        }
    }
}

.editor-panel {
    padding: 4px 0 4px 0;
}

.editor-panel-button {
    padding: 4px;
    margin: 0 !important;
    //opacity: 0.8;
}

.editor-panel-button-icon {
    align-self: center;
    margin: 4px;
}

.color-selector-element {
    width: 20px;
    height: 20px;
    margin-bottom: 2px;
    opacity: 0.8;
}

.color-selector-element:hover {
    opacity: 1;
}

.el-popover.el-popper {
    min-width: 32px;
    padding: 4px;
}
</style>