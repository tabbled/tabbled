<template>
    <div v-if="field && !field.isMultiple"> {{value}} </div>
    <div v-if="field && field.isMultiple">
        <el-tag  size="small" v-for="item in value" style="margin-right: 4px">
            {{item}}
        </el-tag>
    </div>
    <div v-else>No field</div>



</template>

<script lang="ts">
import {ref} from "vue";


export default {
    name: "CustomCellRenderer",
    props: ['params'],
    setup(props) {
        let value = ref('')
        let field = ref(props.params.field)

        if (props.params.getValueFunc) {
            let ctx = props.params.context ? props.params.context : {}
            ctx.row = props.params.data

            let val = props.params.getValueFunc.exec(ctx)

            if (val instanceof Promise) {
                val.then(val => value.value = val)
            } else {
                value.value = val
            }
        }

        //Formatting numbers
        if (value.value &&
            field.value &&
            field.value.type === 'number'
            && field.value.config.format
            && field.value.config.format !== 'none') {
            value.value = Number.parseFloat(Number(value.value).toFixed(field.value.config.precision)).toLocaleString('ru-RU')
        }

        return {
            value,
            field
        }
    },
    mounted() {

    }
}

</script>

<style lang="scss">
</style>