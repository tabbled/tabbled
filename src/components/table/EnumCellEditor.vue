<template>
    <div style="display: flex; flex-direction: row; width: 100%; padding-top: 1px">
        <el-select
            class="cell-editor"
            style="width: 100%"
            v-if="field"
            size="small"
            ref="el"
            v-model="value"
            :placeholder="$t('select')"
            filterable
            clearable
            :multiple="field.isMultiple"
        >
            <el-option
                v-for="item in field.values"
                :key="item.key"
                :label="item.title"
                :value="item.key"
            />
        </el-select>
    </div>
</template>

<script lang="ts">
import {defineComponent, nextTick, ref} from "vue";

export default defineComponent({
    name: "EnumCellEditor",
    props: ['params'],
    setup(props) {
        // the current/initial value of the cell (before editing)

        console.log('EnumCellEditor')
        const field = props.params.field
        const value = ref(props.params.value);

        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        const getValue = () => {
            if (!value.value)
                return null

            return field.isMultiple ? value.value.join(',') : value.value
        };

        // Gets called once before editing starts, to give editor a chance to
        // cancel the editing before it even starts.
        const isCancelBeforeStart = () => {
            return false;
        };

        // Gets called once when editing is finished (eg if Enter is pressed).
        // If you return true, then the result of the edit will be ignored.
        const isCancelAfterEnd = () => {
            return false
        };

        return {
            value,
            field,
            getValue,
            isCancelBeforeStart,
            isCancelAfterEnd
        }
    },
    mounted() {
        // focus on the input field once editing starts
        nextTick(() => this.$refs.el.focus());
    }
})

</script>

<style lang="scss">
    .cell-editor {
        width: 100%;
        height: 100%;

        .el-select__wrapper {
            box-shadow: unset !important;
            border-radius: unset;
            padding-left: 11px;
            padding-bottom: 2px;
        }
    }
</style>