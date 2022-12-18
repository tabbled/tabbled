<template>
<!--    <CodeEditor>-->
<!--    </CodeEditor>-->

        <LayoutBuilder :layout="layout" :size="LayoutSize.large" :available-widgets="widgets">  </LayoutBuilder>

<!--    <Table style="margin-top: 100px" :data-source="ds" :columns="cols"></Table>-->


</template>

<script setup>
//import {defineComponent} from "vue";
import {DataSource} from "./../model/datasource"
import { ref } from 'vue'
import {Column} from "./../model/column";
import LayoutBuilder from '../components/LayoutBuilder.vue'
import { LayoutSize } from "../model/layout";
import { useStore } from "vuex"

let store = useStore();

console.log(store.getters["datasource/getByAlias"]('ssss'))

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

let widgets = [
    {
        title: "W 1",
        alias: "w1",
        datatype: "string",
        defaultCols: 6,
        defaultRows: 1
    },
    {
        title: "W 2",
        alias: "w2",
        datatype: "string",
        defaultCols: 4,
        defaultRows: 2
    }
]

let layout = {
    large: [
        {
            cFrom: 1,
            cTo: 13,
            rFrom: 1,
            rTo: 1,
            type: "field",
            title: "1",
            icon: "table",
            alias: "aaa"
        },
        {
            cFrom: 1,
            cTo: 7,
            rFrom: 2,
            rTo: 2,
            type: "field",
            title: "Field 1199922",
            icon: "filter",
            alias: "11sd"
        },{
            cFrom: 7,
            cTo: 13,
            rFrom: 3,
            rTo: 5,
            type: "field",
            title: "1",
            icon: "table",
            alias: "aaa"
        },{
            cFrom: 1,
            cTo: 13,
            rFrom: 6,
            rTo: 6,
            type: "table",
            props: {
                title: "4"
            },
        }
    ],
    small: []
}

let cols = []

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