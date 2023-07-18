<template>
    <el-input-number
        v-if="field"
        style="width: 100%; height: 100% !important;"
        class="cell-editor"
        size="small"
        ref="el"
        :controls="false"
        :precision="field.precision ? field.precision : 0"
        v-model="value"
    />
</template>

<script lang="ts">
import {defineComponent, nextTick, ref} from "vue";

export default defineComponent({
    name: "NumberCellEditor",
    props: ['params'],
    setup(props) {
        // the current/initial value of the cell (before editing)

        const field = props.params.field
        const value = ref(
            props.params.value === null || props.params.value === undefined
            ? null :
            Number(props.params.value));

        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        const getValue = () => {
            // this simple editor doubles any value entered into the input
            return value.value
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

        .el-input__wrapper {
            box-shadow: unset !important;
            border-radius: unset;
            padding-left: 11px !important;
            height: 100% !important;
        }
    }
</style>