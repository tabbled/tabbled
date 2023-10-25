<template>
    <el-tree-select

        ref="el"
        class="table-select"
        size="small"
        style="order: 0; height: 100%; width: 350px;"
        v-model="value"
        :render-after-expand="false"
        check-strictly
        :multiple="field.isMultiple"
        @remove-tag="removeTag"
        :placeholder="$t('select')"
        :props="treeProps"
        node-key="id"
        lazy
        :load="load"
        :cache-data="linkData"
    />
</template>

<script lang="ts">
import {defineComponent, nextTick, ref} from "vue";
import {GetDataManyOptions} from "../../model/datasource";
import _ from "lodash";


export default defineComponent({
    name: "TreeCellEditor",
    props: ['params'],
    setup(props) {
        const field = props.params.field
        const value = ref(props.params.value);
        let linkData = ref([])
        let isLoading = ref(false)
        let ds = props.params.dataSource
        const displayProp = field.displayProp ? field.displayProp : 'name'
        const treeProps = {
            label: displayProp,
            children: 'children',
            isLeaf: 'isLeaf',
        }

        if (props.params.data[`__${field.alias}_entities`]) {
            linkData.value = props.params.data[`__${field.alias}_entities`]
        }

        const getValue = () => {
            // this simple editor doubles any value entered into the input
            console.log('getValue', value.value)
            return value.value
        };

        const isCancelBeforeStart = () => {
            return false;
        };

        const isCancelAfterEnd = () => {
            return false
        };

        const getCacheData = async () => {
            console.log('getCacheData', props.params)
            if (props.params.getListFunc) {
                let ctx = props.params.context ? _.cloneDeep(props.params.context) : {}
                ctx.row = props.params.data
                ctx.options = {
                    filter: [],
                    take: 20,
                    fields: [displayProp],
                    parentId: null,
                    id: field.isMultiple ? value.value : [value.value]
                }

                let val = props.params.getListFunc.exec(ctx)
                if (val instanceof Promise) {
                    val.then((val) => {
                        console.log(val)
                        linkData.value = val.data
                    })
                } else {
                    linkData.value = val.data
                }
            }

            if (!ds)
                return

            let dataSource = await ds

            let opt:GetDataManyOptions = {
                filter: [],
                take: 20,
                fields: [displayProp],
                id: field.isMultiple ? value.value : [value.value]
            }

            linkData.value = await dataSource.getMany(opt)

            return linkData.value
        }

        const load = async (node, resolve) => {
            console.log('load', node)

            if (props.params.getListFunc) {

                let ctx = props.params.context ? _.cloneDeep(props.params.context) : {}
                ctx.row = props.params.data
                ctx.options = {
                    filter: [],
                    take: 20,
                    fields: [displayProp],
                    parentId: node.parent ? node.data.id : null,
                    route: getRouteToNode(node)
                }

                let val = props.params.getListFunc.exec(ctx)

                if (val instanceof Promise) {
                    val.then(val => resolve(val.data))
                } else {
                    resolve(val.data)
                }

            }

            if (!ds)
                return

            let dataSource = await ds

            let opt:GetDataManyOptions = {
                filter: [],
                take: 20,
                fields: [displayProp],
                parentId: node.parent ? node.data.id : null,
                route: getRouteToNode(node)
            }

            dataSource.getMany(opt).then(res => {
                for (let i in res.data) {
                    res.data[i].isLeaf = !res.data[i].hasChildren
                }
                resolve(res.data)
            })
        }

        const removeTag = (tag) => {
            for(let i in value.value) {
                if (value.value[i] === tag)
                    value.value.splice(i, 1)
            }
        }

        const getRouteToNode = (node) => {
            if (!node.parent) {
                return [];
            }

            return [
                ...getRouteToNode(node.parent),
                node.data.id,
            ];
        }

        return {
            value,
            field,
            linkData,
            isLoading,
            treeProps,
            getCacheData,
            load,
            removeTag,
            getValue,
            isCancelBeforeStart,
            isCancelAfterEnd
        }
    },
    mounted() {
        // focus on the input field once editing starts
        this.getCacheData()
        nextTick(() => this.$refs.el.focus())


    },
})

</script>

<style lang="scss">
    .cell-editor {
        width: 100%;
        height: 100%;

        .el-input__wrapper {
            width: 100%;
            box-shadow: unset !important;
            border-radius: unset;
            padding-left: 11px !important;
        }
    }
</style>