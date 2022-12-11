<template>
    <CodeEditor>
    </CodeEditor>


    <Table style="margin-top: 100px" :data-source="ds" :columns="cols"></Table>

</template>

<script setup>
//import {defineComponent} from "vue";
import {DataSource} from "./../model/datasource"
//import { ref } from 'vue'
import {Column} from "./../model/column";

let ds = new DataSource({
    fields: [{
        title: "field 1",
        type: "number",
        alias: "name"
    },{
        title: "field 2",
        type: "number",
        alias: "color"
    }],
    keyField: "name",
    alias: "",

})

let cols =  []

console.log(ds.fields)

ds.fields.forEach(f => {
    console.log(f)
    cols.push(new Column({
        width: 200,
        sortable: true
    }, f) )
})



ds.onCellChange = (row, newValue, oldValue) => {
    console.log(row, newValue, oldValue)
}

</script>

<style lang="scss">

.editor {
    .el-card__body {
        padding: 0;
    }
    .cm-content {
        padding: 0;
    }
}

</style>