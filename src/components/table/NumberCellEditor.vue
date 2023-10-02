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

        const getValue = () => {
            return value.value
        };


        return {
            value,
            field,
            getValue
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