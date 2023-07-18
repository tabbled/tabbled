<template>
    <el-date-picker v-if="field"
                    ref="el"
                    style="width: 100%"
                    size="small"
                    class="cell-editor"
                    v-model="value"
                    :type="field.type"
                    :format="format(field.type)"
    />
</template>

<script lang="ts">
import {defineComponent, nextTick, ref} from "vue";

export default defineComponent({
    name: "DatetimeCellEditor",
    props: ['params'],
    setup(props) {
        // the current/initial value of the cell (before editing)

        const field = props.params.field
        const value = ref(props.params.value);

        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        const getValue = () => {
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

        function format(type) {
            switch (type) {
                case "date": return 'DD.MM.YYYY';
                case "time": return 'HH:mm:ss';
                case "datetime": return 'DD.MM.YYYY HH:mm:ss';
            }
        }

        return {
            value,
            field,
            format,
            getValue,
            isCancelBeforeStart,
            isCancelAfterEnd
        }
    },
    mounted() {
        // focus on the input field once editing starts
        nextTick(() => this.$refs.el.focus());
        console.log(this.$refs.el)
    }
})

</script>

<style lang="scss">
    .cell-editor {
        width: 100%;
        height: 100%;

        .el-input__wrapper {
            box-shadow: unset !important;
            border-radius: unset;
            padding-left: 11px !important;
        }
    }
</style>