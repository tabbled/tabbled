<template>
    <el-card shadow="never" body-style="padding: 0" style="width: 100%">
        <div v-for="(item, idx)  in list" :id="item[keyProp]" class="list-item">
            <div class="list-item-title">
                <Icon icon="ic:baseline-drag-indicator" style="padding-right: 4px; color: var(--el-border-color)" width="16"/>
                {{item[titleProp]}}
            </div>
            <div class="list-item-actions">
                <el-button link
                           size="small"
                           @click="emit('edit', idx)">
                    <Icon icon="ic:baseline-edit" width="16"/>
                </el-button>
                <el-button link
                           size="small"
                           @click="emit('remove', idx)">
                    <Icon icon="ic:baseline-delete" width="16"
                          />
                </el-button>
            </div>

        </div>
        <el-divider style="margin: 0"/>
        <el-button link size="small"
                   style="margin: 4px;
                   padding-left: 8px"
                   @click="emit('insert')">
            Add
        </el-button>
    </el-card>

</template>

<script setup lang="ts">

import {onMounted} from "vue";
import {Icon} from "@iconify/vue";

interface Props {
    list: Array<object>
    keyProp: string,
    titleProp: string,
    subtitle?: string,
    sortable?: boolean,
    removable?: boolean,
    insertable?:boolean
}

const props = withDefaults(defineProps<Props>(), {
    sortable: true,
    removable: true,
    insertable: true,
    list: () => []
})
const emit = defineEmits(['edit', 'remove', 'insert'])

onMounted(() => {
   // console.log(props)
})

</script>

<style lang="scss">

.list-item {
    display: flex;
    flex-flow: wrap;
    padding-top: 4px;
    padding-bottom: 4px;
    align-items: center;
    justify-content: space-between;
}

.list-item-title {
    display: flex;
    flex-flow: wrap;
    align-items: center;
    padding-left: 8px;
}

.list-item-actions {
    opacity: 0;
    padding-right: 8px
}

.list-item:hover  {
    background: var(--el-color-primary-light-9);
}

.list-item:hover .list-item-actions {
    opacity: 80;
}




</style>