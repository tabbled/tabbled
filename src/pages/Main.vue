<template>
<!--    <CodeEditor>-->
<!--    </CodeEditor>-->

        <ViewLayout :layout="layout"></ViewLayout>

<!--    <Table style="margin-top: 100px" :data-source="ds" :columns="cols"></Table>-->


</template>

<script setup>
//import {defineComponent} from "vue";
import {DataSource} from "./../model/datasource"
import { ref } from 'vue'
import {Column} from "./../model/column";
import ViewLayout from './../components/ViewLayout.vue'
import {LayoutComponent} from "../model/layout";

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

let layout = {

    desktop: {
        rows: [{
            widgets: [{
                colspan: 5,
                type: "table",
                props: {},
            }]
        },{
            widgets: [{
                rowspan: 2,
                colspan: 1,
                type: "table",
                props: {},
            },{
                colspan:4,
                type: "table",
                props: {},
            }]
        },{
            widgets: [{
                colspan: 4,
                type: "table",
                props: {},
            }]
        }]
    },
    mobile: {
        rows:[]
    },

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