<template>
    <div style="display: flex; flex-flow: row; align-self: center">
        <div style="align-items: center; display: flex; cursor: pointer; padding-left: 16px" @click="back()">
            <Icon icon="mdi:arrow-left" width="16"/>
        </div>

        <div style="display: flex; flex-flow: column;">

            <div class="title" >{{$t('settings')}}</div>
            <div class="path">
                <div style="display: flex" v-for="(item,idx)  in _currentPathArray">
                    <div v-if="idx > 0" class="path-separator">/</div>
                    <el-button :disabled="idx === _currentPathArray.length -1"
                               style="font-weight: normal; cursor: auto;"
                               link
                               @click="setPathIdx(idx)" >{{item}}</el-button>

                </div>
            </div>
        </div>
    </div>

    <div class="panel">

        <div v-if="properties && currentElement" :style="{'max-height': scrollHeight - 100+ 'px'}">
                <el-form label-position="top" style="padding: 0 0 0 16px" ref="pageForm" :model="currentElement" size="small">
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
                        <el-input-number
                            v-else-if="prop.type === 'number'"
                            :controls="false"
                            :precision="prop.precision ? prop.precision : 0"
                            :model-value="getValue(prop, currentElement)"
                            @input="(val) => onInput(prop.alias, val)"
                        />
                        <el-checkbox v-else-if="prop.type === 'bool'"
                                     :label="prop.title"
                                     :model-value="getValue(prop, currentElement)"
                                     @change="(val) => onInput(prop.alias, val)"
                        />
                        <LinkSelect v-else-if="prop.type === 'enum'"
                                    :field="prop.alias"
                                    :field-config="prop"
                                    :model-value="getValue(prop, currentElement)"
                                    @change="(val) => onInput(prop.alias, val)"
                        />
                        <DataSourceSelect v-else-if="prop.type === 'datasource'"
                                    style="width: 100%"
                                    :config="prop"
                                    :model-value="getValue(prop, currentElement)"
                                    @change="(val) => onInput(prop.alias, val)"
                        />
                        <HandlerEditor v-else-if="prop.type === 'handler'"
                                       :model-value="getValue(prop, currentElement) ? getValue(prop, currentElement) : { type: 'script', script: '' }"
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
                        <FieldSelect v-else-if="prop.type === 'field'"
                                     style="width: 100%"
                                     :data-source="getDataSource()"
                                     :model-value="getValue(prop, currentElement)"
                                     @change="(val, field) => onFieldSelectInput(prop.alias, val, field)"/>
                        <UserRoleSelect v-else-if="prop.type === 'role'"
                                        :model-value="getValue(prop, currentElement)"
                                        @change="(val, field) => onFieldSelectInput(prop.alias, val, field)"/>

                        <div v-else style="color: var(--el-color-danger)">Don't have an element for type "{{prop.type}}"</div>
                    </el-form-item>
                </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface, generateEntityWithDefault} from "../model/field";
import {PageConfigInterface, pageProperties, PageTypesProperties} from "../model/page";
import HandlerEditor from "./HandlerEditor.vue";
import ItemList from "./ItemList.vue";
import _ from 'lodash'
import {useComponentService} from "../services/component.service";
import DataSourceSelect from "./DataSourceSelect.vue";
import FieldSelect from "./FieldSelect.vue";
import { FlakeId } from '../flake-id'
import UserRoleSelect from "./UserRoleSelect.vue";
let flakeId = new FlakeId()

let componentService = useComponentService()

let pageForm = ref(null)
let divToHeight = ref(null)
let scrollHeight = ref(window.innerHeight)

let properties = ref<FieldConfigInterface[]>([])
let currentElement = ref(null)
let _currentPath = ''
let _currentPathArray = ref(['Path'])

let pageListTypesProperties = new PageTypesProperties()


const emit = defineEmits(['update', 'path-changed'])
const props = defineProps<{
    pageConfig: PageConfigInterface,
    currentPath: string
}>()

watch(() => props,
    async () => {
        setCurrentElement(props.currentPath ? props.currentPath : '')
    },
    {
        deep: true
    })

watch(() => props.currentPath,
    async () => {
        setCurrentElement(props.currentPath ? props.currentPath : '')
        onPathChanged(props.currentPath)
    },
    {
        deep: true
    })


function setPathIdx(idx: number) {
    let path = ''
    for (let i = 1; i <= idx; i++) {
        if (path !== '') path += '.';
        path += _currentPathArray.value[i]
    }

    emit('path-changed', path)
}

function back() {
    let path = ''
    for (let i = 1; i <= _currentPathArray.value.length -2; i++) {
        if (path !== '') path += '.';
        path += _currentPathArray.value[i]
    }

    emit('path-changed', path)
    setCurrentElement(path)
}

function onPathChanged(path) {
    //currentConfigPath.value = path
    console.log(path)
    emit('path-changed', path)

    _currentPathArray.value = path !== "" ? path.split('.') : []
    _currentPathArray.value.splice(0, 0, 'Page');
}

function setCurrentElement(cpath: string) {
    if (cpath === '') {
        properties.value = pageProperties
        currentElement.value = props.pageConfig
    } else {
        let fields = getFieldsByPath(cpath)
        if (!fields) {
            console.error(`List item not found for property path ${cpath}`)
            return;
        }

        properties.value = fields
        currentElement.value = _.get(props.pageConfig, cpath)
    }

    if (_currentPath !== cpath) {
        _currentPath = cpath
        emit('path-changed', cpath)
    }
}

function getPropPath(alias: string) {
    return  _currentPath !== '' ? _currentPath + '.' + alias : alias
}

function getList(prop: string) {
    return _.get(props.pageConfig, getPropPath(prop))
}

function getFieldsByPath(path: string): FieldConfigInterface[] {
    let parentProps = pageProperties;
    let _path = _.toPath(path);

    for(let i in _path) {
        // !!! It's not a good way to determine a list element
        if (!Number.isNaN(Number.parseInt(_path[i])))
            continue;

        let prop = getFieldByAlias(parentProps, _path[i])

        if (prop.type !== 'list') {
            console.error(`Field's ${_path[i]} type isn't a list`)
            return undefined;
        }

        if (prop.listOf === 'element') {
            //Each element consists their own properties unlike of list types
            let el = _.get(props.pageConfig, buildPath(Number(i) + 1))

            let elProps = componentService.getByName(el.name)
            if (!elProps) {
                console.warn(`Component "${el.name}" not registered`)
                return undefined;
            }

            parentProps = elProps.properties
        } else {
            let listItemProps = pageListTypesProperties.getPropertiesByType(prop.listOf)

            if (!listItemProps) {
                console.error(`List item properties not found for type ${prop.listOf}`)
                return;
            }

            parentProps = listItemProps.fields
        }
    }

    function buildPath(count: number):any[] {
        let res = []
        for (let i = 0; i < count+1; i++) {
            res.push(_path[i])
        }
        return res
    }

    function getFieldByAlias(list: FieldConfigInterface[], alias: string):FieldConfigInterface {
        for(let i in list) {
            if (list[i].alias === alias) {
                return list[i]
            }
        }
        return undefined;
    }

    return parentProps;
}

function onListEdit(path:string, idx: number) {
    setCurrentElement(`${getPropPath(path)}[${idx}]`)
}

async function onListInsert(alias:string, field: FieldConfigInterface) {
    let path = _currentPath !== '' ?  _currentPath + '.' + alias : alias;
    let list = _.get(props.pageConfig, path)
    let fields = getFieldsByPath(path)

    if (list === undefined || list === null) {
        list = []
    }

    let n = await generateEntityWithDefault(fields)
    n[field.keyProp] = `${field.listOf}${list.length + 1}`
    n[field.displayProp] = `${field.listOf}${list.length + 1}`
    n.id = (await flakeId.generateId()).toString()

    list.push(n)

    emit('update', path, list)
}

function onListRemove(alias:string, idx: number) {
    let path = getPropPath(alias)
    let lst =_.get(props.pageConfig, path);
    lst.splice(idx, 1)
    emit('update', path, lst)
}

onMounted(() => {
    if (divToHeight.value)
        scrollHeight.value = window.innerHeight - divToHeight.value.$el.offsetTop - 60

    setCurrentElement('')
})

function onInput(alias: string, value: any) {
    emit('update', getPropPath(alias), value)
}

function onFieldSelectInput(alias: string, value: any, field: FieldConfigInterface) {
    emit('update', getPropPath(alias), value)

    if(!currentElement.value['title'] || currentElement.value['title'] === '') {
        currentElement.value['title'] = field.title
    }
}

//Returns parent's datasource, if not found, then returns page datasource
function getDataSource() {
    let items = _currentPath.split('.')
    items.splice(items.length - 1, 1);
    let parentPath = items.join('.').toString()

    let parent = _.get(props.pageConfig, parentPath)

    if (!parent || !parent.datasource)
        return props.pageConfig.datasource

    return parent.datasource
}

function getValue(prop: FieldConfigInterface, element: any) {
    return element[prop.alias]
}

</script>

<style lang="scss">

.el-input-number .el-input__inner {
    text-align: left !important;
}

.el-input-number.is-without-controls .el-input__wrapper {
    padding-right: 8px !important;
    padding-left: 8px !important;
}

.panel {
    background: white;
    z-index: 0;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: auto;
    padding-top: 16px;


    .path-separator {
        padding-left: 4px;
        padding-right: 4px;
    }
}

.title {
    font-size: var(--el-font-size-medium);
    padding-left: 16px;
}

.path {
    font-size: var(--el-font-size-small);
    display: flex;
    flex-flow: wrap;
    height: 24px;
    padding-left: 16px;
}

</style>