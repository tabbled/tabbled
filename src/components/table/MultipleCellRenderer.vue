<template>
    <div v-if="notFound">{{$t('notFound')}}</div>

    <div v-else>
        <el-tag  size="small" v-for="item in value" style="margin-right: 4px">
            {{item}}
        </el-tag>
    </div>

</template>

<script lang="ts">
import {ref} from "vue";


export default {
    name: "MultipleCellRenderer",
    props: ['params'],
    setup(props) {
        let value = ref([])
        let notFound = ref(false)
        const field = props.params.field
        const displayProp = field.displayProp ? field.displayProp : 'name'
        if (!props.params.value)
            return


        if (field.type === 'link') {
            let data = props.params.data[`__${field.alias}_entities`]
            if (!data || !data.length) {
                notFound.value = true
                return
            }
            data.forEach(item => {
                value.value.push(item[displayProp])
            })
        }

        if (field.type === 'string') {
            if (typeof props.params.value === 'string') {
                //value.value = props.params.value.split(',')
                value.value = JSON.parse(props.params.value)
            } else if(props.params.value instanceof Array) {
                value.value = props.params.value
            }
        }

        if (field.type === 'enum') {
            if (field.values instanceof Function) {
                field.values().then(items => {
                    value.value = getEnumTitles(items, props.params.value)
                })
            } else {
                value.value = getEnumTitles(field.values, props.params.value)
            }

            function getEnumTitles(fieldEnum, value) {
                let list = []

                value.forEach(item => {
                    let v = fieldEnum.find(i => i.key === item)
                    list.push(v ? v.title : item)
                })

                return list
            }
        }

        return {
            value,
            notFound
        }
    },
    mounted() {



    }
}

</script>

<style lang="scss">
</style>