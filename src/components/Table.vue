<script setup lang="ts">
//import { ref } from 'vue'
import {DataSourceInterface} from "../model/datasource";
import {ColumnInterface} from "../model/column";



interface Props {
    dataSource: DataSourceInterface,
    columns: ColumnInterface[],
    isRowSelectable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    isRowSelectable: true
})

const data = props.dataSource.getAll()



//console.log(props.dataSource.fields[0].alias)

let getHeaderCellClass = (column: any) => {
    return column.column.order === '' || !column.column.order ? 'hidden-sort-wrapper' : ''
}

let getHeader = (scope: any) => {
    //console.log(scope)
    let fieldIndex = props.isRowSelectable ? scope.$index -1 : scope.$index
    //console.log(scope.$index,props.dataSource.fields)
    return props.dataSource.fields[fieldIndex].title
}


</script>

<template>
    <el-table border
              :data="data"
              :fit="true"
              highlight-current-row
              :header-cell-class-name="getHeaderCellClass"
    >
        <el-table-column v-if="isRowSelectable" type="selection" width="38" />
        <el-table-column v-for="element in columns"
                         :sortable="element.sortable ? 'custom' : false"
                         :key="element.field.alias"
                         :label="element.title"
                         :width="element.width"
                         :prop="element.field.alias"

        >
            <template #default="scope">
                <div>
                    {{scope.column.no}}
                </div>

            </template>
            <template #header="scope">
                {{getHeader(scope)}}
            </template>
        </el-table-column>

        <el-table-column fixed="right" width="40">
            <template #header>
                <el-button text style="border-radius: 0">
                    <span class="iconify " data-icon="mdi:play" style="width: 18px; height: 18px; padding-right: 4px"/>
                </el-button>
            </template>
            <template #default></template>
        </el-table-column>
    </el-table>
</template>

<style lang="scss">

.hidden-sort-wrapper {
    .cell {
        .caret-wrapper {
            visibility: hidden !important;
        }
    }
}



</style>
