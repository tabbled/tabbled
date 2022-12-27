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
import {onMounted, ref, watch} from 'vue'
import {DataSourceInterface} from "../model/datasource";
import {Column, ColumnConfigInterface} from "../model/column";


interface Props {
    dataSource: DataSourceInterface,
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
    let classes: string = 'custom-table-header';
    if (column.column.order === '' || !column.column.order)
        classes += ` hidden-sort-wrapper`
    return  classes
}

let getHeaderTitle = (scope: any) => {
    let idx = props.isRowSelectable ? scope.$index -1 : scope.$index
    return columns.value[idx].title
}

let getCellData = (scope: any) => {
    const entity: object | null = props.dataSource.getByRow(scope.$index);

    if (!entity)
        return ''

    return entity[scope.column.property] ? entity[scope.column.property] : ''
}

function init() {
    columns.value = []
    data.value = []

    if (!props.dataSource) {
        console.warn(`DataSource parameter for Table component not set`)
        return;
    }

    props.columns.forEach(colConfig => {
        let field = props.dataSource.getFieldByAlias(colConfig.field);

        if (field) {
            let column = new Column(colConfig, field)
            columns.value.push(column)
        } else
            console.warn(`Field "${colConfig.field}" not found in data source ${props.dataSource.alias}`)

    })

    if (props.dataSource)
        data.value = props.dataSource.getAll()
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
