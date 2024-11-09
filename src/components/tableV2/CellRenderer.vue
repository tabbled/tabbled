<template>
    <div v-if="props.cell.getValue() !== undefined && props.cell.getValue() !== null"
         :class="{'cell-renderer': true, wordwrap: getWordwrap()}">

            <el-tag v-if="field && field.type === 'enum'" v-for="title in getRenderedValue()"
                    type="primary"
                    size="small">
                {{title}}
            </el-tag>
        <div v-else>
            {{getRenderedValue()}}
        </div>

    </div>
    <div v-else>
        <el-tag class="null-value" type="info" size="small">{{$t('null')}}</el-tag>
    </div>
</template>

<script setup lang="ts">

import {FieldInterface} from "../../model/field";
import {Column} from "../column";
import {Cell} from "@tanstack/vue-table";
import numeral from "numeral";
import dayjs from "dayjs";

interface Props {
    cell: Cell<any,any>,
    field?: FieldInterface,
    columnDef?: Column
}

const props = withDefaults(defineProps<Props>(), {
    cell: null,
    field: null,
    columnDef: null
})

const getRenderedValue = () => {
    if (!props.field || !props.columnDef) {
        return props.cell.getValue()
    }

    if (props.field.type === 'number'){
        return numeral(props.cell.getValue()).format(props.columnDef.format)
    }

    if (['time', 'date', 'datetime'].includes(props.field.type)) {
        return dayjs(props.cell.getValue()).format(props.columnDef.format)
    }

    if (props.field.type === 'enum' ) {
        if (props.field.isMultiple) {
            return props.cell.getValue().map(e => e.title)
        } else {
            return [props.cell.getValue().title]
        }
    }

    return props.cell.getValue()
}

const getWordwrap = () => {
    if (!props.columnDef) {
        return false
    }

    return props.columnDef.wordwrap
}

</script>

<style lang="scss">

.cell-renderer {
    width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    align-content: center;
    height: 100%;
}

.wordwrap {
    white-space: normal;
}

.null-value {
    opacity: 0.5;
}
</style>