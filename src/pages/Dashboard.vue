<template>

    <el-table
        :data="tableData"
        style="width: 100%; margin-bottom: 20px"
        row-key="id"
        border
        default-expand-all
    >
        <el-table-column prop="date" label="Date" sortable />
        <el-table-column prop="name" label="Name" sortable />
        <el-table-column prop="address" label="Address" sortable />
    </el-table>
</template>

<script setup lang="ts">
const tableData = [
    {
        id: 1,
        date: '2016-05-02',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        id: 2,
        date: '2016-05-04',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
    },
    {
        id: 3,
        date: '2016-05-01',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
        children: [
            {
                id: 31,
                date: '2016-05-01',
                name: 'wangxiaohu',
                address: 'No. 189, Grove St, Los Angeles',
            },
            {
                id: 32,
                date: '2016-05-01',
                name: 'wangxiaohu',
                address: 'No. 189, Grove St, Los Angeles',
                children: [
                    {
                        id: 31,
                        date: '2016-05-01',
                        name: 'wangxiaohu',
                        address: 'No. 189, Grove St, Los Angeles',
                    },
                    {
                        id: 32,
                        date: '2016-05-01',
                        name: 'wangxiaohu',
                        address: 'No. 189, Grove St, Los Angeles',
                    },
                ],
            },
        ],
    },
    {
        id: 4,
        date: '2016-05-03',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
    },
]
</script>

<style scoped>

</style>