import Table from '@tiptap/extension-table'

export const DatasetTable = Table.extend({
    addAttributes() {
        return {
            dataset: {
                default: 'null',
            }
        }
    }
})