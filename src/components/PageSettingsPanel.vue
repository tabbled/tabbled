<template>
    <div class="panel">
        <div class="title">Settings</div>
        <div class="subtitle">{{visiblePath}}</div>
        <el-divider ref="divToHeight" style="margin-top: 8px; margin-bottom: 8px"/>

        <div v-if="properties && currentElement" >
            <el-scrollbar :height="scrollHeight" always>
                <el-form label-position="top" ref="pageForm" :model="currentElement" size="small">
                    <el-form-item v-for="(prop, idx)  in properties.filter(item => !item.hidden)"
                                  style="margin-bottom: 8px;"
                                  :tabindex="idx"
                                  :show-message="false"
                                  :label="prop.type === 'bool' ? '' : prop.title"
                                  :required="prop.required || false"
                                  :prop="prop.alias">
                        <el-input v-if="prop.type === 'string'"
                                  :model-value="getValue(prop, currentElement)"
                                  @input="(val) => onInput(prop.alias, val)"
                        />
                        <el-input v-else-if="prop.type === 'text'"
                                  type="textarea"
                                  :autosize="{ minRows: 2, maxRows: 4 }"
                                  :model-value="getValue(prop, currentElement)"
                                  @input="(val) => onInput(prop.alias, val)"
                        />
                        <el-checkbox v-else-if="prop.type === 'bool'"
                                     :label="prop.title"
                                     :model-value="getValue(prop, currentElement)"
                                     @change="(val) => onInput(prop.alias, val)"
                        />
                        <el-select-v2 v-else-if="prop.type === 'dataset'"
                                      style="width: 100%"
                                      filterable
                                      :model-value="getValue(prop, currentElement)"
                                      :options="dataSetOptions"
                        />
                        <HandlerEditor v-else-if="prop.type === 'handler'"
                                       :type="getValue(prop, currentElement) ? getValue(prop, currentElement).type : 'script'"
                                       :script="getValue(prop, currentElement) ? getValue(prop, currentElement).script : ''"
                                       @update="(val) => onInput(prop.alias, val)"
                        />
                        <ItemList v-else-if="prop.type === 'list'"
                                  :list="getList(prop.alias)"
                                  :keyProp="prop.keyProp"
                                  :titleProp="prop.displayProp"
                                  @edit="(row) => onListEdit(prop.alias, row)"
                                  @insert="() => onListInsert(prop.alias, prop)"
                                  @remove="(row) => onListRemove(prop.alias, row)"
                        />
                        <div v-else style="color: var(--el-color-danger)">Don't have an element for type "{{prop.type}}"</div>
                    </el-form-item>
                </el-form>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";
import {PageConfigInterface, pageProperties, PageTypesProperties} from "../model/page";
import HandlerEditor from "./HandlerEditor.vue";
import ItemList from "./ItemList.vue";
import _ from 'lodash'
import {useComponentService} from "../services/component.service";


let componentService = useComponentService()

let pageForm = ref(null)
let dataSetOptions = ref([])
let divToHeight = ref(null)
let scrollHeight = ref(window.innerHeight)

let properties = ref<FieldConfigInterface[]>([])
let currentElement = ref(null)
let visiblePath = ref('')
let propertiesPath = ''
let _currentPath = ''
let pageListTypesProperties = new PageTypesProperties()


const emit = defineEmits(['update'])
const props = defineProps<{
    pageConfig: PageConfigInterface,
    currentPath: string
}>()

watch(() => props,
    async () => {
        populateDataSetsList()
    },
    {
        deep: true
    })

watch(() => props.currentPath,
    async () => {
        setCurrentElement(props.currentPath ? props.currentPath : '')
    },
    {
        deep: true
    })

function setCurrentElement(cpath: string) {
    if (cpath === '') {
        //it means root it is a page config
        properties.value = pageProperties
        currentElement.value = props.pageConfig
        propertiesPath = ''

        visiblePath.value = 'Page'
        _currentPath = cpath;
        return;
    }

    console.log(cpath)

    let path = _.toPath(cpath)
    let prop = getFieldByProp(path[path.length - 2])

    if (!prop) {
        console.error(`List item not found for property path ${cpath}`)
        return;
    }
    if (prop.type !== 'list') {
        console.error(`Property of path ${cpath} is not an list item`)
        return;
    }

    // special condition for element because field should be gotten from element
    if (prop.listOf === 'element') {

        if (path.length > 2) {
            console.warn(`Can't resolve path for elements ${cpath}`)
            return
        }
        let el = _.get(props.pageConfig, cpath)
        console.log(el)

        let component = componentService.getByName(el.name)
        if (!component) {
            console.warn(`Component "${el.name}" not registered`)
            return []
        }

        properties.value = component.properties
        currentElement.value = el.properties
        propertiesPath = '.properties'
        visiblePath.value = 'Page / element'
        _currentPath = cpath + propertiesPath;

    } else {

        let el = _.get(props.pageConfig, cpath)
        let listItemProps = pageListTypesProperties.getPropertiesByType(prop.listOf)

        if (!listItemProps) {
            console.error(`List item properties not found for type ${prop.listOf}`)
            return;
        }

        properties.value = listItemProps.fields
        currentElement.value = el
        propertiesPath = ''
        visiblePath.value = 'Page / ' + prop.listOf
        _currentPath = cpath;
    }
}

function getPropPath(prop: string) {
    let p = `${_currentPath}${propertiesPath}`
    return  p !== '' ? p + '.' + prop : prop
}

function getList(prop: string) {
    return _.get(props.pageConfig, getPropPath(prop))
}

function getFieldByProp(prop: string): FieldConfigInterface {
    console.log('getFieldByProp', properties.value)

    for(const i in properties.value) {
        let p = properties.value[i]
        if (p.alias === prop)
            return p;
    }
    return undefined;
}

function onListEdit(path:string, idx: number) {
    setCurrentElement(`${getPropPath(path)}[${idx}]`)
}

function onListInsert(path:string, field: FieldConfigInterface) {
    let list = _.get(props.pageConfig, path)

    console.log(path, field)
    console.log(props.pageConfig)
    let n = {}
    n[field.keyProp] = `${field.listOf}${list.length + 1}`
    n[field.displayProp] = `${field.listOf}${list.length + 1}`

    list.push(n)

    emit('update', path, list)
}

function onListRemove(path:string, idx: number) {
    let lst =_.get(props.pageConfig, path);
    lst.splice(idx, 1)
    emit('update', path, lst)
}

function populateDataSetsList() {
    dataSetOptions.value = props.pageConfig.dataSets.map(item => {
        return {
            value: item.alias,
            label: item.alias
        }
    })
}

onMounted(() => {
    if (divToHeight.value)
        scrollHeight.value = window.innerHeight - divToHeight.value.$el.offsetTop - 60
    populateDataSetsList()
    setCurrentElement('')
})

function onInput(alias: string, value: any) {
    emit('update', `${
        props.currentPath === ''
            ? ''
            : props.currentPath + propertiesPath + '.'
    }${alias}`, value)
}

function getValue(prop: FieldConfigInterface, element: any) {
    return element[prop.alias]
}

</script>

<style lang="scss">

.panel {
    background: white;
    z-index: 0;
    width: 100%;
    padding: 16px;

    .title {
        font-size: var(--el-font-size-medium);
    }

    .subtitle {
        font-size: var(--el-font-size-small);
    }

    .el-scrollbar {
        height: unset;
    }
}



</style>