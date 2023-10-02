<template>
    <div>{{value}}</div>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue";


export default defineComponent({
    name: "TotalsRenderer",
    props: ['params'],
    setup(props) {
        let value = ref(null)
        const field = props.params.field
        const totalFunc = props.params.total

        if (props.params.value === null || props.params.value === undefined)
            return

        if (totalFunc && totalFunc !== 'none') {
            value = Number.parseFloat(Number(props.params.value).toFixed(field.config.precision)).toLocaleString('ru-RU')
        }

        return {
            value
        }
    },
    mounted() {

    }
})

</script>

<style lang="scss">
</style>