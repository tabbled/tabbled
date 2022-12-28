<template>
    <el-table
            border
            :data="data"
            :fit="true"
            highlight-current-row
            :header-cell-class-name="getHeaderCellClass"
            :header-row-class-name="getHeaderClass"
            :row-class-name="getRowClass"
    >
        <el-table-column v-if="isRowSelectable" type="selection" width="30" />
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
import {onMounted, ref, watch} from 'vue'
import {Column, ColumnConfigInterface} from "../model/column";
import {DataSet} from "../model/dataset";


interface Props {
    dataSet: DataSet,
    columns: ColumnConfigInterface[],
    isRowSelectable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    isRowSelectable: true
})

const data = ref<Array<Object>>([])
let columns = ref<Array<Column>>([])

watch(() => props,
    async () => {
        init();
    },
    {
        deep: true
    })

onMounted(() => {
    init();
});

let getHeaderCellClass = (column: any) => {
    let classes: string = 'table-cell-header';
    if (column.column.order === '' || !column.column.order)
        classes += ` hidden-sort-wrapper`
    return  classes
}

let getHeaderTitle = (scope: any) => {
    let idx = props.isRowSelectable ? scope.$index -1 : scope.$index
    return columns.value[idx].title
}

let getCellData = (scope: any) => {
    if (!props.dataSet)
        return;

    const entity: object | undefined = props.dataSet.getByRow(scope.$index);

    if (!entity)
        return ''

    return entity[scope.column.property] ? entity[scope.column.property] : ''
}

function getRowClass() {
    return "table-row"
}

function getHeaderClass() {
    return "table-header"
}

function init() {
    columns.value = []
    data.value = []

    if (!props.dataSet) {
        console.warn(`DataSet parameter for Table component not set`)
        return;
    }

    props.columns.forEach(colConfig => {
        let field = props.dataSet.getFieldByAlias(colConfig.field);

        if (field) {
            let column = new Column(colConfig, field)
            columns.value.push(column)
        } else
            console.warn(`Field "${colConfig.field}" not found in data source ${props.dataSet.dataSource?.alias}`)

    })

    if (props.dataSet) {
        data.value = props.dataSet.data
    }
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

.table-header {
    .el-table__cell {
        padding: 4px;
    }

    .cell {
        padding-left: 4px;
        padding-right: 4px;

    }
}

.table-cell-header {

    .cell {
        white-space: nowrap !important;
        font-weight: 500 !important;
    }

    .el-table__cell {
        padding: 4px;

    }
}

.adv-column {
    .cell {
        white-space: nowrap;
        text-overflow: clip;
    }

}

.table-row {
    .cell {
        padding-left: 4px;
        padding-right: 4px;
    }

    .el-table__cell {
        padding: 4px;
    }
}



</style>
