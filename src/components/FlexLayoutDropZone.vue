<template>
    <div
        :class="{ 'drop-zone-design': mode === 'design', 'drop-zone': true}"
        @drop="drop($event)"
        @dragover.prevent
        @dragenter.prevent
        :style="{ 'flex-direction': direction }"
    >
        <el-form-item v-for="(element, idx) in elements.filter(el => el.isVisible)"
                      :class="{ draggable: mode === 'design', 'selected': mode === 'design' && selected === element.id, 'element-wrapper': !element.props.customStyle  }"
                      :draggable="mode === 'design'"
                      @dragstart.self="(e) => dragStart(e, element, idx)"
                      @dragover="(e) => onDragover(e, element, idx)"
                      @dragend="dragEnd"
                      :label="getLabelElement(element)"
            :style="element.props.customStyle ? JSON.parse(element.props.customStyle) : {padding: '8px 16px'}"
        >
            <div v-if="mode === 'design'"
                 :class="{'settings-drag-panel': mode === 'design', 'prevent-select': true, 'selected': selected === element.id }"
                 @click.stop="(e) => onElementClick(e, element, idx)"
            >
                {{element.name}}
                <div class="delete-button" >
                    <Icon :id="String(idx)" icon="mdi:delete" @click="() => emit('remove', `${parent}.${idx}`)"/>
                </div>
            </div>
            <component :is="element.name"
                       :id="element.id"
                       v-bind="mode === 'design' ? element : element.props"
                       :parent="`${props.parent}.${idx}`"
                       :mode="mode"
                       @remove="(e) => emit('remove', e)"
                       @select="(e) => emit('select', e)"
                       :selected="selected"
                       @click.stop="(e) => onElementClick(e, element, idx)"
                       :context="context"
                       :fieldConfig="element.fieldConfig"
                       @change="(value) => emit('update:fieldValue', element, value)"
                       :model-value="element.fieldValue"

            />
        </el-form-item>
    </div>
</template>

<script setup lang="ts">

import {generateEntityWithDefault} from "../model/field";
import {ElementInterface, ScreenSize} from "../model/page";
import {FlakeId} from "../flake-id";
import {useComponentService} from "../services/component.service";

let componentService = useComponentService()
let flakeId = new FlakeId()
let dragElement = {
    idx: -1,
    item: null
}

interface Props {
    id: string,
    screenSize: ScreenSize,
    elements: ElementInterface[],
    mode: 'design' | 'view',
    direction: 'row' | 'column',
    parent: string,
    selected: string,
    context: any
}

const props = withDefaults(defineProps<Props>(), {
    screenSize: ScreenSize.desktop,
    elements: () => [],
    mode: "design",
    direction: "column",
    parent: '',
    selected: ''
})

const emit = defineEmits([
    'update:modelValue',
    'update:elements',
    'update:mode',
    'remove',
    'select',
    'update:fieldValue'
])

function dragStart(event, item, idx) {
    event.dataTransfer.setData('item', JSON.stringify(item))
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('from', `${props.parent}.${idx}`)
}

function dragEnd() {
    dragElement.idx = -1
    dragElement.item = null
}

function onDragover(e, element, idx) {
    dragElement.idx = idx
    dragElement.item = element
}

async function drop(e:DragEvent) {
    e.stopPropagation()
    e.preventDefault();

    if (!e.dataTransfer.getData('item')) {
        console.error('no item in dataTransfer', e)
        return
    }

    let item = JSON.parse(e.dataTransfer.getData('item'));

    if (e.dataTransfer.getData('from')) {
        if (item.id === props.id)
            return

        let path = e.dataTransfer.getData('from')

        emit('remove', path)
        props.elements.splice(dragElement.idx, 0, item);
    } else {
        let comp = componentService.getByName(item.name);

        let properties = await generateEntityWithDefault(comp.properties)
        properties.screenSize = props.screenSize
        properties.selected = ''

       //console.log(item)
        properties = Object.assign(properties, item['props'])

        props.elements.push({
            id: (flakeId.generateId()).toString(),
            name: comp.name,
            field: '',
            elements: [],
            layout: {
                'desktop': {},
                'mobile': {}
            },
            isVisible: true,
            props: properties,
            ...properties
        })
        emit('update:elements', props.elements)
    }
}

function onElementClick(event, element, idx) {
    event.preventDefault()
    emit('select', `${props.parent}.${idx}`)
}

function getLabelElement(el) {
    if (el['title'] || (el.props && el.props['title'] && el.props['title'] !== "")) {
        return el['title'] || el.props['title'].toString()
    }
    return ""
}

</script>

<style lang="scss">

.drop-zone-design {
    min-height: 200px;
    border: #747bff 1px solid;
}

.drop-zone {
    display: flex;
    position: relative;
}

.draggable {
    position: inherit;
    border: 1px var(--el-border-color-dark) dashed;
}

.settings-drag-panel {
    position: absolute;
    z-index: 1;
    background: var(--el-color-primary-light-3);
    border: var(--el-border-color-lighter) 1px;
    cursor: move;
    display: flex;
    flex-direction: row;
    left: 0;
    top: 0;
    opacity: 0.7;
}

.prevent-select {
    -webkit-user-select: none;  /* Safari */
    -ms-user-select: none;      /* IE 10 and IE 11 */
    user-select: none;          /* Standard syntax */
}

.delete-button {
    cursor: default;
}

.selected {
    background: var(--el-color-primary-light-9);
    outline: var(--el-color-primary-light-3) solid 1px;
}

.element-wrapper {
    padding: 8px 16px;
}

</style>