import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import Component from './parameter-view.vue'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        parameter: {
            /**
             * Add a template parameter that will be replaced while rendering report
             */
            addParameter: (attributes?: { }) => ReturnType

            getContext: () => {}
        }
    }
}

export default Node.create({
    name: 'parameter',

    group: 'inline',

    inline: true,

    atom: true,

    draggable: true,

    selectable: false,


    addAttributes() {
        return {
            alias: {
                default: "",
            },
            title: {
                default: ""
            },
            filter: {
                default: ""
            }
        }
    },


    parseHTML() {
        return [
            {
                tag: 'parameter',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['parameter', mergeAttributes(HTMLAttributes)]
    },

    addNodeView() {
        return VueNodeViewRenderer(Component)
    },

    addCommands() {
        return {
            addParameter:
                () => ({ commands }) => {
                    return commands.insertContent("<parameter alias='' title='' filter=''></parameter>");
                }
        }
    },

    addKeyboardShortcuts() {
        return {
            'Mod-p': () => this.editor.commands.addParameter(),
            'Mod-P': () => this.editor.commands.addParameter(),
        }
    },
})