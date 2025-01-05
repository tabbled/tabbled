<template>
    <node-view-wrapper class="inline-block" as="parameter" alias="" label="">

        <Popover v-slot="{ open, close }">
            <PopoverButton class="leading-tight break-all bg-transparent text-ellipsis border-dashed border rounded border-blue-500 p-0 pr-2 pl-2 text-inherit text-[length:inherit] font-inherit"
            @click="handleClickMenu(open)">
                {{node.attrs.title ? node.attrs.title : $t('report.designer.parameterNotSet')}}
            </PopoverButton >

            <div v-if="isOpen">
            <PopoverPanel focus style="z-index: 99999" class="fixed bg-white w-80 shadow-sm border rounded flex flex-col max-h-96"
                           @keyup="e => onKeyUp(e, close)"
            >
                <input class="focus:outline-none focus:ring-blue-400 ring-1 rounded-t ring-transparent ring-inset
                 hover:ring-gray-100 p-1 pl-3 pr-3"
                       style="width: 100%"
                       type="text"
                       ref="searchInput"
                       :value="searchText"
                       @input="onInput"
                       :placeholder="$t('report.designer.parameterSearch')"/>

                <div v-if="!items.length" class="w-full text-center p-2 text-gray-400">
                    {{$t('report.designer.noItems')}}
                </div>

                <div v-else class="overflow-auto h-full border-t">
                    <div v-for="(item, idx)  in items"
                         :id="item[keyProp]"
                         class="flex flex-row items-center cursor-default hover:bg-blue-50 rounded p-1 w-full group text-sm"
                         @click="handleClick(idx, item)"
                         @dblclick="handleSelect(item, close)"
                         :class="{'bg-blue-100 hover:bg-blue-200': idx === selectedIdx || item[keyProp] === node.attrs.alias}"
                    >
                        <div class="w-full ml-2 mr-2 overflow-hidden text-nowrap text-ellipsis">
                            <div>
                                {{item[titleProp]}}
                            </div>
                            <div class="text-gray-400 font-mono text-xs">
                                {{item[pathProp]}}
                            </div>
                        </div>
                        <div class="pr-2 font-mono text-gray-500">
                            {{item[typeProp]}}
                        </div>

                    </div>
                </div>

                <input class="focus:outline-none focus:ring-blue-400 ring-1 rounded-b ring-transparent ring-inset
                 hover:ring-gray-100 p-1 pl-3 pr-3 border-t"
                       style="width: 100%"
                       type="text"
                       :value="filterValue"
                       @input="onFilterInput"
                       placeholder="Filter value..."/>

            </PopoverPanel>
            </div>
        </Popover>

    </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import {Popover, PopoverButton, PopoverOverlay, PopoverPanel} from "@headlessui/vue";
import {nextTick, ref} from 'vue'

export default {

    components: {
        PopoverOverlay,
        PopoverPanel,
        Popover,
        PopoverButton,
        NodeViewWrapper,

    },
    setup() {
        let items = ref([])
        let originItems = []
        let keyProp = 'id'
        let titleProp = 'label'
        let typeProp = 'dataType'
        let pathProp = 'path'
        let selectedIdx = ref(null)
        let searchText = ref("")
        let searchInput = ref(null)
        let isOpen = ref(false)
        let filterValue = ref("")


        return {
            items,
            keyProp,
            typeProp,
            titleProp,
            selectedIdx,
            searchText,
            searchInput,
            isOpen,
            pathProp,
            originItems,
            filterValue
        }
    },

    beforeMount() {
        this.filterValue = this.node.attrs.filter
    },

    props: nodeViewProps,

    methods: {
        handleClick(idx, item) {
            this.selectedIdx = idx

        },
        handleSelect(item, close) {
            this.selectAndCLose(item, close)
        },
        onInput(e) {
            this.searchText = e.target.value
            if (this.searchText !== "") {
                this.items = this.originItems.filter(f => f[this.titleProp].includes(this.searchText) || f[this.keyProp].includes(this.searchText))
            } else {
                this.items = this.originItems
            }
            if (this.items.length)
                this.selectedIdx = 0
        },
        onFilterInput(e) {
            this.filterValue = e.target.value
            this.updateAttributes({
                filter: this.node.attrs.filter = this.filterValue
            })
        },
        async handleClickMenu(open) {
            open = !open

            if (open) {
                this.originItems = await this.editor.getContext(this)
                this.items = this.originItems
            }
            this.isOpen = open
            await nextTick(() => this.searchInput?.focus());
        },
        selectAndCLose(item, close) {
            this.searchText = ""
            this.updateAttributes({
                alias: this.node.attrs.alias = item.id,
                title: this.node.attrs.title = item.label
            })

            close()
            this.editor.commands.selectParentNode()
        },
        onKeyUp(e, close) {
            if (!this.items.length) {
                return
            }
            if (e.key === 'ArrowDown') {
                if (this.selectedIdx === null || this.selectedIdx === this.items.length -1) {
                    this.selectedIdx = 0
                } else this.selectedIdx += 1

            } else if (e.key === 'ArrowUp') {
                if (this.selectedIdx === null || this.selectedIdx === 0) {
                    this.selectedIdx = this.items.length -1
                } else this.selectedIdx -= 1
            }

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                document.getElementById(this.items[this.selectedIdx].id).scrollIntoView({ behavior: "instant", block: "end" })
            }

            if (e.key === 'Enter') {
                this.selectAndCLose(this.items[this.selectedIdx], close)
            }
        }
    },

}
</script>

<style lang="scss">
.tiptap {
    .content {
        margin: 0 8px;
    }
}
</style>