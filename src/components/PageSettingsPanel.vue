<template>
    <div class="panel">
<!--        <el-divider ref="divToHeight" style="margin-top: 8px; margin-bottom: 8px"/>-->



        <div v-if="properties && currentElement" :style="{'max-height': scrollHeight - 60 + 'px'}">
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
<!--                        <LinkSelect v-else-if="prop.type === 'link'"-->
<!--                                    style="width: 100%"-->
<!--                                    :field="prop"-->
<!--                                    :model-value="getValue(prop, currentElement)"-->
<!--                                    @change="(val) => onInput(prop.alias, val)"-->
<!--                        />-->
                        <DataSourceSelect v-else-if="prop.type === 'datasource'"
                                    style="width: 100%"
                                    :config="prop"
                                    :model-value="getValue(prop, currentElement)"
                                    @change="(val) => onInput(prop.alias, val)"
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
                        <FieldSelect v-else-if="prop.type === 'field'"
                                     style="width: 100%"
                                     :data-source="pageConfig.datasource"
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
let flakeId = new FlakeId()

let componentService = useComponentService()



let pageForm = ref(null)
let dataSetOptions = ref([])
let divToHeight = ref(null)
let scrollHeight = ref(window.innerHeight)

let properties = ref<FieldConfigInterface[]>([])
let currentElement = ref(null)
let _currentPath = ''

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
    },
    {
        deep: true
    })

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

    let n = generateEntityWithDefault(fields)
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

// function populateDataSetsList() {
//     if (!props.pageConfig)
//         return;
//
//     dataSetOptions.value = props.pageConfig.dataSets.map(item => {
//         return {
//             value: item.alias,
//             label: item.alias
//         }
//     })
//}

//function getDataSourceConfig(prop: FieldConfigInterface): DataSetConfigInterface | undefined {


    //props.pageConfig

    //let alias = ""

    // If prop.dataSetField not set, find first field with dataset type
    // if (!prop.dataSetField) {
    //     for (const i in properties.value) {
    //         let f = properties.value[i]
    //
    //         if (f.type === 'dataset') {
    //             alias = _.get(props.pageConfig, _currentPath + '.' + f.alias)
    //             break
    //         }
    //     }
    // } else {
    //     alias = alias = _.get(props.pageConfig, _currentPath + '.' + prop.dataSetField)
    // }
    //
    // console.log(alias)
    //
    // if (alias === "")
    //     return undefined;
    //
    // for(const i in props.pageConfig.dataSets) {
    //     if (props.pageConfig.dataSets[i].alias === alias)
    //         return props.pageConfig.dataSets[i]
    // }

//    return undefined;
//}

onMounted(() => {
    if (divToHeight.value)
        scrollHeight.value = window.innerHeight - divToHeight.value.$el.offsetTop - 60

    setCurrentElement('')
})

function onInput(alias: string, value: any) {
    //console.log(alias, value)
    emit('update', getPropPath(alias), value)
}

function onFieldSelectInput(alias: string, value: any, field: FieldConfigInterface) {
    emit('update', getPropPath(alias), value)

    console.log(currentElement.value)
    if(!currentElement.value['title'] && currentElement.value['title'] === '') {
        currentElement.value['title'] = field.title
    }
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
    //padding: 16px;
    overflow-y: auto;
    overflow-x: hidden;
    scroll-behavior: auto;
}



</style>