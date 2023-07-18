<template>
    <div style="display: flex; flex-direction: row; width: 100%; padding-top: 1px">
        <el-select
            v-if="field"
            ref="el"
            size="small"
            class="cell-editor"
            v-model="value"
            :placeholder="$t('select')"
            filterable
            remote
            clearable
            remote-show-suffix
            :remote-method="getLinkData"
            :loading="isLoading"
            :multiple="field.isMultiple"
        >
            <el-option
                v-for="item in linkData"
                :key="item.id"
                :label="item[displayProp]"
                :value="item.id"
            />
        </el-select>

        <el-button v-if="field && field.type === 'link' && field.config.searchDialog"
                   text
                   @click="searchDialogVisible = true"
                   style="width: 32px; opacity:0.5; margin-left: 4px"
        >
            <Icon icon="mdi:magnify" width="24"/>
        </el-button>
    </div>

    <DialogView v-if="field && field.config.searchDialog"
                :screen-size="ScreenSize.desktop"
                v-model:visible="searchDialogVisible"
                :options="{modal: true, page: field && field.config.searchDialog}"
                @selected="dialogSelected"
                selecting
    />
</template>

<script lang="ts">
import {defineComponent, nextTick, ref} from "vue";
import {GetDataManyOptions} from "../../model/datasource";
import {useI18n} from "vue-i18n";
import DialogView from "../DialogView.vue";
import {ScreenSize} from "../../model/page";


export default defineComponent({
    name: "LinkCellEditor",
    computed: {
        ScreenSize() {
            return ScreenSize
        }
    },
    components: {DialogView},
    props: ['params'],
    setup(props) {
        // the current/initial value of the cell (before editing)
        const { t } = useI18n();
        const field = props.params.field
        const value = ref(props.params.value);
        let linkData = ref([])
        let isLoading = ref(false)
        let ds = props.params.dataSource
        const displayProp = field.displayProp ? field.displayProp : 'name'
        let initTitle = props.params.data[`__${field.alias}_title`]
        let searchDialogVisible = ref(false)

        //console.log(value.value)
        if (!initTitle)
            initTitle = t('notFound')

        linkData.value.push({
            id: value.value,
            [displayProp]: initTitle
        })

        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        const getValue = () => {
            // this simple editor doubles any value entered into the input
            console.log('getValue', value.value)
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

        const getLinkData = async (query?: string) => {
            let fGetList = await field.getListFunc()
            if (fGetList) {
                linkData.value = await fGetList.exec(Object.assign({ query: query, row: props.params.data }))
                return;
            }

            if (!ds)
                return

            let opt:GetDataManyOptions = {
                filter: [],
                take: 50,
                fields: [displayProp],
                include: null
            }

            if (value.value) {
                opt.include = field.isMultiple ? value.value : [value.value]
            }

            if (query) {
                opt.search = query
            }

            isLoading.value = true
            linkData.value = (await ds.getMany(opt)).data

            isLoading.value = false
        }

        const dialogSelected = (val) => {
            value.value = val
        }

        return {
            value,
            field,
            linkData,
            isLoading,
            displayProp,
            searchDialogVisible,
            dialogSelected,
            getLinkData,
            getValue,
            isCancelBeforeStart,
            isCancelAfterEnd
        }
    },
    mounted() {
        // focus on the input field once editing starts
        this.getLinkData()
        nextTick(() => this.$refs.el.focus());

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