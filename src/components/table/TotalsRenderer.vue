<template>
    <div>{{value}}</div>
</template>

<script lang="ts">
import {ref} from "vue";
import numeral from "numeral";


export default {
    name: "TotalsRenderer",
    props: ['params'],
    setup(props) {
        let value = ref(null)
        const field = props.params.field
        const totalFunc = props.params.total

        if (props.params.value === null || props.params.value === undefined)
            return

        if (totalFunc && totalFunc !== 'none') {
            value = numeral(props.params.value).format('0,0.' + '0'.repeat(field.config.precision) + (field.config.format === 'currency' ? ' $' : ''))
        }

        return {
            value
        }
    },
    mounted() {

    }
}

</script>

<style lang="scss">
</style>