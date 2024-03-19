<template>
    <el-dialog class="dialog"
               :model-value="visible"
               @close="emit('update:visible', false)"
               :title="pageConfig ? pageConfig.title : 'Dialog'"
               :modal="options && options.modal ? options.modal : true"
               draggable
               :width="options && options.width ? options.width : '60%'"
               :fullscreen="screenSize === ScreenSize.mobile"
               :append-to-body="true"

    >
        <el-form ref="grid"  class="grid-wrap" :model="editEntity" label-position="top" style="padding: 0; height: 100%">

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
                           @update:selected="selectedChanged"
                />
            </el-form-item>
        </el-form>
        <template #footer>
            <div v-if="options.selecting" style="display: flex; flex-direction: row; justify-content: end;">
                <el-button @click="emit('update:visible', false)">{{$t('close')}}</el-button>
                <el-button :disabled="!selected" type="primary" @click="select">{{$t('select')}}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">

import {ElementInterface, OpenDialogOptions, PositionElementInterface, ScreenSize} from "../model/page";
import {useDataSourceService} from "../services/datasource.service";
import {ref, watch} from "vue";
import {CustomDataSource, DataSourceInterface, EntityInterface} from "../model/datasource";
import _ from "lodash";
import {useComponentService} from "../services/component.service";
import {Filters, useFilters} from "../model/filter";
import {generateEntityWithDefault} from "../model/field";

const dsService = useDataSourceService();
let componentService = useComponentService()
let pageConfig = ref(null)
let selected = ref<string[]>([])

const props = defineProps<{
    screenSize: ScreenSize,
    visible: boolean,
    options: OpenDialogOptions
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
let maxHeight = ref('')

const emit = defineEmits(['update:visible', 'selected'])

watch(() => props.visible, () => {
    if (props.visible) {
        init()
    } else {
        if (props.options.onClose instanceof Function) {
            props.options.onClose({ options: props.options, selected: selected.value })
        }
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
    maxHeight.value = '200px'

    if (pageConfig.value.datasource) {
        editDataSource = await dsService.create(pageConfig.value.datasource)
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

        console.log('isNew', isNew.value, 'id', id)
        console.log('editEntity', editEntity.value)
    }



    for(const i in pageConfig.value.elements) {
        const element = pageConfig.value.elements[i]
        let el:ElementInterface = {
            id: element.id,
            layout: element.layout,
            name: element.name,
            field: element.field,
            props: {},
            filterable: element.filterable,
            isVisible: true
        }

        let elProps = componentService.getByName(el.name)
        if (!elProps) {
            console.warn(`Component "${el.name}" not registered`)
            return;
        }


        for(let ii in elProps.properties) {
            const prop = elProps.properties[ii]
            el.props[prop.alias] = _.cloneDeep(element[prop.alias])


            if (prop.type === 'datasource') {
                let ds = await dsService.create(element[prop.alias])
                if (!ds) {
                    console.warn(`DataSource ${prop.datasource} for field ${prop.alias} not found`)
                    continue
                }

                if (ds instanceof CustomDataSource)
                    ds.setContext(scriptContext.value)


                if (editEntity.value && element.field)
                    await ds.setData(editEntity.value[element.field])

                el.props['datasourceInst'] = ds
            }
        }
        el.props['context'] = scriptContext.value


        if (elProps.filterable || elProps.group === 'Filters') {
            el.props['filters'] = filters
        }

        console.log(el.props)

        if (elProps.properties)
            elements.value.push(el)
    }

    if (props.options.onOpen instanceof Function) {
        props.options.onOpen({ options: props.options })
    }
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

function getField(el:ElementInterface | any) {
    if (!editDataSource) {
        return undefined
    }
    return editDataSource.getFieldByAlias(el.field)
}

function getValue(el: ElementInterface | any) {
    //console.log('getValue', el.field, editEntity.value[el.field])
    if (editEntity.value)
        return editEntity.value[el.field]

    return undefined
}

async function setValue(el:ElementInterface | any, value: any) {
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

    if (props.options.onSelect instanceof Function) {
        props.options.onSelect({ options: props.options, selected: selected.value })
    }
}

function selectedChanged(sl) {
    selected.value = sl
}

</script>

<style lang="scss">

.dialog {
    .el-dialog__body {
        padding: 0;
        padding-bottom: 16px;
        overflow: auto;
        max-height: calc(100vh - 300px);
    }
}


</style>