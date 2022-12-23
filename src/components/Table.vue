<template>
    <el-table
            border
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
                    {{getCellData(scope)}}
                </div>

            </template>
            <template #header="scope">
                {{getHeaderTitle(scope)}}
            </template>
        </el-table-column>

        <el-table-column fixed="right" width="40" :resizable="false" class-name="adv-column">
            <template #header>
                <el-button text style="border-radius: 0; padding: 0; margin: 0 ">
                    <span class="iconify " data-icon="mdi:cog" style="width: 18px; height: 18px;"/>
                </el-button>
            </template>
            <template #default></template>
        </el-table-column>
    </el-table>
</template>

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

//const data = props.dataSource.getAll()






//console.log(props.dataSource.fields[0].alias)

let getHeaderCellClass = (column: any) => {
    let classes: string = 'custom-table-header';
    if (column.column.order === '' || !column.column.order)
        classes += ` hidden-sort-wrapper`
    return  classes
}

let getHeaderTitle = (scope: any) => {
    //console.log(scope)
    let fieldIndex = props.isRowSelectable ? scope.$index -1 : scope.$index
    //console.log(scope.$index,props.dataSource.fields)
    return props.dataSource.fields[fieldIndex].title
}

let getCellData = (scope: any) => {
    const entity: object | null = props.dataSource.getByRow(scope.$index);

    if (!entity)
        return ''

    return entity[scope.column.property] ? entity[scope.column.property] : ''
}


</script>

<style lang="scss">

.hidden-sort-wrapper {
    .cell {
        .caret-wrapper {
            visibility: hidden !important;
        }
    }
}

.custom-table-header {
    .cell {
        white-space: nowrap !important;
        font-weight: normal !important;
    }
}

.adv-column {
    .cell {
        background: #535bf2;
        white-space: nowrap;
        text-overflow: clip;
    }

}



</style>
