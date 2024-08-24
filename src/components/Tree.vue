<template>
    <el-card shadow="never" body-style="padding: 0" style="width: 100%">
    <el-tree :data="data"
             :node-key="keyProp"
             :props="treeProps"
             default-expand-all
             :expand-on-click-node="false"
             draggable
             @node-drag-end="change"
    >

        <template #default="{ node, data }">

            <div class="tree-item">
                <div class="tree-item-title" @click="emit('edit', data[keyProp])">
                    {{data[titleProp]}}
                </div>
                <div class="tree-item-actions">
                    <el-button link
                               size="small"
                               @click="emit('insert', data[keyProp])"
                               style="z-index: 99"
                    >
                        <Icon icon="ic:outline-add-box" width="16"
                        />
                    </el-button>
                    <el-button link
                               size="small"
                               @click="emit('remove', data[keyProp])"
                               style="z-index: 99"
                    >
                        <Icon icon="ic:baseline-delete" width="16"
                        />
                    </el-button>
                </div>
            </div>
        </template>



    </el-tree>
        <div v-if="!data.length" style="width: 100%; justify-content: center; display: flex; padding-bottom: 8px">
            <el-button type="primary"
                       @click="emit('insert')"
                       style="z-index: 99"
            >
                Insert new
            </el-button>
        </div>

    </el-card>
</template>

<script setup lang="ts">

import {Icon} from "@iconify/vue";

function change() {
    emit('change', props.data)
}

interface Props {
    data: any[]
    keyProp?: string,
    titleProp?: string,
    sortable?: boolean,
    removable?: boolean,
    insertable?: boolean,
    childrenProp?: string
}

const props = withDefaults(defineProps<Props>(), {
    sortable: true,
    removable: true,
    insertable: true,
    keyProp: 'id',
    titleProp: 'title',
    childrenProp: 'items',
    data: () => []
})
const emit = defineEmits(['edit', 'remove', 'insert', 'change'])

const treeProps = {
    children: props.childrenProp,
    label: props.titleProp,
}

</script>

<style scoped>

.tree-item {
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: space-between;
    height: 16px;
    width: 100%;
}

.tree-item-title {
    display: flex;
    flex-flow: wrap;
    align-items: center;
    align-content: center;
    padding-left: 8px;
    cursor: pointer;
    width: 100%;
    height: 20px;
}

.tree-item-actions {
    opacity: 0.4;
    padding-right: 8px
}


</style>