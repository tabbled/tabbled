<template>
    <el-dialog class="dialog"
               :model-value="visible"
               style="padding: 0"
               @close="emit('update:visible', false)"
               :title="pageConfig ? pageConfig.title : 'Dialog'"
               :modal="options && options.modal ? options.modal : false"
               draggable
               :width="options && options.width ? options.width : '60%'"
               :fullscreen="screenSize === ScreenSize.mobile"
               :append-to-body="true"
    >
        <el-form ref="grid"  class="grid-wrap" :model="editEntity" label-position="top" style="padding: 0">

            <el-form-item v-for="(element, idx) in elements"
                          :label="getLabelElement(element)"
                          :style="getGridElementStyle(element.layout)"
                          class="element">

                <component :id="element.id || idx.toString()"
                           :is="element.name"
                           v-bind="element.props"
                           :fieldConfig="getField(element)"
                           :model-value="getValue(element)"
                           @change="(value) => setValue(element, value)"
                           :context="scriptContext"
                           @update:currentId="currentIdChanged"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <div style="display: flex; flex-direction: row; justify-content: end;">
                <el-button @click="emit('update:visible', false)">{{$t('close')}}</el-button>
                <el-button :disabled="!selected" type="primary" @click="select">{{$t('select')}}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">

import {ElementInterface, PositionElementInterface, ScreenSize} from "../model/page";
import {useDataSourceService} from "../services/datasource.service";
import {ref, watch} from "vue";
import {DataSourceInterface, EntityInterface} from "../model/datasource";
import _ from "lodash";
import {useComponentService} from "../services/component.service";
import {Filters, useFilters} from "../model/filter";
import {generateEntityWithDefault} from "../model/field";

const dsService = useDataSourceService();
let componentService = useComponentService()
let pageConfig = ref(null)
let selected = ref(null)

const props = defineProps<{
    screenSize: ScreenSize,
    visible: boolean,
    options: any,
    selecting?: boolean
}>()

const scriptContext = ref({
    page: {
        params: {}
    },
    item: null,
    openDialog: null
})

let editEntity = ref<EntityInterface>(null)
let editDataSource: DataSourceInterface = null
let isNew = ref(false)
let elements = ref<Array<ElementInterface>>([])
let filters = ref<Filters>(null)

const emit = defineEmits(['update:visible', 'selected'])

watch(() => props.visible, () => {
    if (props.visible) {
        init()
    }
})

async function init() {
    pageConfig.value = await dsService.pageDataSource.getByKey(props.options.page)
    if (!pageConfig.value) {
        console.error(`Page ${props.options.page} not found`)
        return
    }

    if (pageConfig.value.isEditPage && !props.options.id) {
        console.error(`id is not provided for edit page "${props.options.page}"`)
        return;
    }

    elements.value = []
    editDataSource = null
    editEntity.value = null

    if (pageConfig.value.datasource) {
        editDataSource = await dsService.getByAlias(pageConfig.value.datasource)
        if (!editDataSource) {
            console.warn(`DataSource ${pageConfig.value.datasource} for editing page ${pageConfig.value.alias} not found`)
            return;
        }

        filters = useFilters(editDataSource)

        let id = props.options.id

        if (id && id !== 'new') {
            editEntity.value = await editDataSource.getById(id)
            isNew.value = false
        } else {
            editEntity.value = await generateEntityWithDefault(editDataSource.fields)
            isNew.value = true
        }
    }

    pageConfig.value.elements.forEach(element => {
        let el:ElementInterface = {
            id: element.id,
            layout: element.layout,
            name: element.name,
            field: element.field,
            props: {},
            filterable: element.filterable
        }

        let elProps = componentService.getByName(el.name)
        if (!elProps) {
            console.warn(`Component "${el.name}" not registered`)
            return;
        }

        elProps.properties.forEach(item => {
            el.props[item.alias] = _.cloneDeep(element[item.alias])


        })
        el.props['context'] = scriptContext.value

        if (elProps.filterable || elProps.group === 'Filters') {
            el.props['filters'] = filters
        }

        if (elProps.properties)

            elements.value.push(el)
    })
}

function getLabelElement(el) {
    if (el.props && el.props['title'] && el.props['title'] !== "") {
        return el.props['title'].toString()
    }
    return ""
}

function getGridElementStyle(layout: {[key in ScreenSize]: PositionElementInterface}) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: "fit-content"
    }

    let position = layout[props.screenSize]
    if (!position) {
        position = layout[ScreenSize.desktop] || layout[ScreenSize.mobile]
    }

    if (position.colFrom) {
        let c = String(position.colFrom);
        if (position.colTo) c += ' / ' + position.colTo;
        style.gridColumn = c;
    }
    if (position.rowFrom) {
        let r = String(position.rowFrom);
        if (position.rowTo) r += ' / ' + position.rowTo;
        style.gridRow = r;
    }
    return style;
}

function getField(el:ElementInterface) {
    if (!editDataSource) {
        return undefined
    }
    return editDataSource.getFieldByAlias(el.field)
}

function getValue(el: ElementInterface) {
    //console.log('getValue', el.field, editEntity.value[el.field])
    if (editEntity.value)
        return editEntity.value[el.field]

    return undefined
}

async function setValue(el:ElementInterface, value: any) {
    //console.log('setValue', el, value)

    if (pageConfig.value.isEditPage.value) {
        if (!editEntity.value)
            return false

        editEntity.value[el.field] = value

        let fSetValue = await editDataSource.getFieldByAlias(el.field).setValueFunc()
        if (fSetValue) {
            return await fSetValue.exec(scriptContext.value)
        }
    } else if (filters.value) {
        if (!el.id) {
            console.warn("Filter component doesn't have correct id")
            return false
        }
    }
}

function select() {
    if (!selected.value) {
        console.error("no selected item")
        return
    }

    emit('selected', selected.value)
    emit('update:visible', false)
}

function currentIdChanged(id) {
    selected.value = id
}

</script>

<style lang="scss">

.dialog {
    .el-dialog__body {
        padding: 0;
        padding-bottom: 16px;
    }
}


</style>