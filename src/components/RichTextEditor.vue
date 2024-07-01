<template>
    <div v-if="editor" style="width: 100%; height: fit-content" >

        <div class="editor-panel" v-if="!readonly">
            <el-button class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleBold().run()">
                <Icon  class="editor-panel-button-icon" icon="material-symbols:format-bold" width="18" />
            </el-button>
            <el-button class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleItalic().run()">
                <Icon  class="editor-panel-button-icon" icon="material-symbols:format-italic" width="18"/>
            </el-button>
            <el-button class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleStrike().run()">
                <Icon  class="editor-panel-button-icon" icon="material-symbols:strikethrough-s" width="18"/>
            </el-button>
            <el-button class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleUnderline().run()">
                <Icon  class="editor-panel-button-icon" icon="material-symbols:format-underlined" width="18"/>
            </el-button>

            <el-button class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleBulletList().run()">
                <Icon  class="editor-panel-button-icon" icon="material-symbols:format-list-bulleted" width="18"/>
            </el-button>
            <el-button class="editor-panel-button" size="small" text @click="editor.chain().focus().toggleOrderedList().run()">
                <Icon  class="editor-panel-button-icon" icon="material-symbols:format-list-numbered" width="18"/>
            </el-button>

            <el-popover
                placement="bottom-start"
                :width="24"
                trigger="click"
            >
                <template #reference>
                    <el-button class="editor-panel-button" size="small" text>
                        <Icon  class="editor-panel-button-icon" icon="material-symbols:format-ink-highlighter-outline-rounded" width="18"/>
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
                    <el-button class="editor-panel-button" size="small" text>
                        <Icon  class="editor-panel-button-icon" icon="material-symbols:format-color-text" width="18"/>
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
                    <el-button class="editor-panel-button" size="small" text>
                        <Icon  class="editor-panel-button-icon" icon="material-symbols:format-h1" width="18"/>
                    </el-button>
                </template>
                <div style="cursor: pointer; margin: 4px"
                     v-for="h in predefinedHeaders"
                     @click="editor.chain().focus().toggleHeading({level: h}).run()"
                >
                    H{{h}}
                </div>
            </el-popover>
        </div>
        <editor-content :class="{ editable: !readonly }" :editor="editor"/>
    </div>

</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import {Underline} from "@tiptap/extension-underline";
import {Color} from "@tiptap/extension-color";
import {TextStyle} from "@tiptap/extension-text-style";
import {Highlight} from "@tiptap/extension-highlight";
import { Level } from "@tiptap/extension-heading";

let editor = ref<Editor>()

const emit = defineEmits(['update:modelValue', 'change'])

const props = defineProps<{
    id?: string,
    modelValue?: any,
    field: string,
    fieldConfig: FieldConfigInterface,
    context?:any,
    autosize?: boolean,
    disabled?: boolean,
    readonly?: boolean
    minHeight?:number
    maxHeight?: number
}>()

let minH = ref(props.minHeight ? props.minHeight + 'px' : 'unset')
let maxH = ref(props.maxHeight ? props.maxHeight + 'px' : 'unset')

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

onMounted(async () => {
    init()
    await getValue()
})

watch(() => props.fieldConfig,
    async () => {
        init()
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
            Highlight.configure({ multicolor: true })
        ],
        content: props.modelValue,
        onUpdate: () => {
            change(editor.value.getHTML())
        },
        editable: !props.disabled && !props.readonly
    })
}

function change(val) {
    value.value = val
    emit('update:modelValue', val)
    emit('change', val)
}

</script>

<style lang="scss">
/* Basic editor styles */

.editable .tiptap{
    box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color)) inset;
}

.tiptap {


    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
    background-color: var(--el-input-bg-color, var(--el-fill-color-blank));
    border: var(--el-input-border);
    font-family: "Roboto", serif;
    padding: 4px 10px 4px 10px;
    height: inherit;
    overflow: auto;
    max-height: v-bind(maxH);
    min-height: v-bind(minH);

    > * + * {
        margin-top: 0.75em;
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

    code {
        background-color: rgba(#616161, 0.1);
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
        border-left: 2px solid rgba(#0D0D0D, 0.1);
    }

    hr {
        border: none;
        border-top: 2px solid rgba(#0D0D0D, 0.1);
        margin: 2rem 0;
    }
}

.editor-panel {
    padding: 4px 0 4px 0;
}

.editor-panel-button {
    padding: 0;
    margin: 0 4px 0 0 !important;
    opacity: 0.8;
}

.editor-panel-button-icon {
    align-self: center;
    margin: 4px;
}

.editable .tiptap:hover {
    box-shadow: 0 0 0 1px var(--el-border-color-hover) inset
}

.editable .tiptap:focus {
    outline: none;
    //box-sizing: border-box;
    box-shadow: 0 0 0 1px var(--el-color-primary) inset
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

mark {
    background-color: #ffe066;
    padding: 0.125em 0;
    border-radius: 0.25em;
    box-decoration-break: clone;
}
</style>