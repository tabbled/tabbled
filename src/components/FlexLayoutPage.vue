<template>
    <el-page-header v-if="mode === 'design'" ref="mainHeader" class="page-header" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{pageConfig ? pageConfig.title : ""}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button v-for="action in pageHeader.actions"
                           :type="action.type ? action.type : 'default'"
                           @click="action.func()"
                >
                    {{action.title}}
                </el-button>
                <el-button v-if="pageConfig ? pageConfig.isEditPage : false" disabled>{{$t('cancel')}}</el-button>
                <el-button v-if="pageConfig ? pageConfig.isEditPage : false" type="primary" disabled>{{$t('save')}}</el-button>
            </div>
        </template>
    </el-page-header>

    <el-form label-position="top">
        <FlexLayoutDropZone
                            :elements="mode === 'view' ? elements : pageConfig.elements"
                            :screen-size="screenSize"
                            :mode="mode"
                            direction="column"
                            parent=""
                            @remove="removeWidget"
                            @select="onSelect"
                            id="0"
                            :selected="selected"
                            @update:elements="emit('update:pageConfig', props.pageConfig)"
                            :context="context"
                            @update:field-value="(element, value) => emit('update:fieldValue', element, value)"
        />
    </el-form>

</template>

<script setup lang="ts">

import {ElementInterface, PageConfigInterface, ScreenSize} from "../model/page";
import {usePageHeader} from "../services/page.service";
import {FlakeId} from "../flake-id";
import FlexLayoutDropZone from "./FlexLayoutDropZone.vue";
import _ from "lodash";
import {ref} from "vue";




let pageHeader = usePageHeader()
let flakeId = new FlakeId()
let selected = ref<string>('')



interface Props {
    screenSize: ScreenSize,
    pageConfig: PageConfigInterface,
    elements: ElementInterface[]
    mode?: 'design' | 'view',
    context: any
}

const props = withDefaults(defineProps<Props>(), {
    screenSize: ScreenSize.desktop,
    pageConfig: null,
    mode: "design"
})


const emit = defineEmits([
    'update:modelValue',
    'update:mode',
    'update:pageConfig',
    'select',
    'update:fieldValue'
])

function removeWidget(path: string) {

    let _p = path.substring(1).split('.')
    _p.splice(_p.length-1, 1)
    let __p = ""
   _p.forEach(i => __p += `.elements[${i}]`)


    let el = _p.length ? _.get(props.pageConfig, __p.substring(1)) : props.pageConfig
    let idxs = path.substring(1).split('.')
    el.elements.splice([idxs[idxs.length - 1]], 1)

    emit('update:pageConfig', props.pageConfig)
}

function toPath(source) {
    if (!source)
        return ''
    let _p = source.substring(1).split('.')
    let __p = ""
    _p.forEach(i => __p += `.elements[${i}]`)
    return __p.substring(1)
}

function onSelect(path: string) {
    let el = _.get(props.pageConfig, toPath(path))

    if (el) {
        emit('select', toPath(selected.value === el.id ? '' : path ))
        selected.value = selected.value === el.id ? '' : el.id
    }
}


</script>

<style lang="scss">

.page-header {
    margin-right: 0;
    margin-left: 0;
}



</style>