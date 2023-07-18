<template>
    <Table style="height: calc(100% - 32px)"
            datasource="groups"
            :columns="colGroupDef"
            id="0"
            :context="{}"

    />
</template>

<script setup lang="ts">

import Table from "../components/Table.vue";

let colGroupDef = [ {
    "id": "1608297653244792832",
    "field": "name",
    "title": "Name",
    "width": 227,
    "visible": true,
    "readonly": false,
    "sortable": true} ]

let colDef = [

    {
        "id": "1608297653244792832",
        "field": "date_order",
        "title": "Дата",
        "width": 227,
        "visible": true,
        "readonly": false,
        "sortable": true
    },
    {
        "id": "1608297653244792831",
        "field": "invoce_done",
        "title": "invoce_done",
        "width": 100,
        "visible": true,
        "readonly": false,
        "sortable": true
    },
    {
        "id": "1608297653244792830",
        "field": "group",
        "title": "Group",
        "width": 400,
        "visible": true,
        "readonly": false,
        "sortable": true
    },
    {
        "id": "1608297764427403264",
        "field": "number",
        "title": "Номер",
        "width": 100,
        "visible": true,
        "readonly": false,
        "sortable": true
    },
    {
        "id": "1614266382461964288",
        "field": "client",
        "title": "client",
        "visible": true,
        "readonly": false,
        "sortable": true,
        "width": 166
    },
    {
        "id": "1611547658965487616",
        "field": "city",
        "title": "Город",
        "width": 200,
        "visible": true,
        "readonly": false,
        "sortable": true
    },
    {
        "id": "1611548333610897408",
        "field": "status",
        "title": "Статус",
        "width": 100,
        "visible": true,
        "readonly": false,
        "sortable": true
    },
    {
        "id": "1611939351040626688",
        "field": "color",
        "title": "Цвет",
        "visible": true,
        "readonly": false,
        "sortable": true,
        "width": 398,
        "wordwrap": true
    }
]

</script>

<style scoped>

</style>