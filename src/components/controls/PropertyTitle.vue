<template>
    <el-popover v-if="tooltip"
                placement="bottom"
                :width="300"
                trigger="hover"
                :persistent="false"
                :show-after="400"
    >
        <template #reference>
            <span  :style="{'text-decoration': 'underline dotted'}">{{title}}</span>
        </template>
        <div v-html="tooltip">

        </div>
    </el-popover>
    <span v-else>{{title}}</span>

</template>

<script setup lang="ts">
const props = defineProps<{
    title: string,
    tooltip?: string
}>()
</script>

<style lang="scss">
code {
    background-color: #f1f1f1;
    border-radius: 5px;
    padding: 2px;
}
</style>