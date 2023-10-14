<template>
    <div
        class="drop-zone"
        @drop="drop($event)"
        @dragover.prevent
        @dragenter.prevent
        :style="{ 'flex-direction': direction }"
    >
        <div v-for="(element, idx) in elements"
             :class="{ draggable: true, 'selected': selected === element.id, 'element-wrapper': true  }"
             draggable="true"
             @dragstart.self="(e) => dragStart(e, element, idx)"
             @dragover="(e) => onDragover(e, element, idx)"
             @dragend="dragEnd"
        >
            <div :class="{'settings-drag-panel': true, 'prevent-select': true, 'selected': selected === element.id }"
                 @click.stop="(e) => onElementClick(e, element, idx)"
            >
                {{element.name}}
                <div class="delete-button" >
                    <Icon :id="String(idx)" icon="mdi:delete" @click="() => emit('remove', `${parent}.${idx}`)"/>
                </div>
            </div>
            <component :is="element.name"
                       :id="element.id"
                       v-bind="element"
                       :elements="element.elements"
                       :parent="`${props.parent}.${idx}`"
                       @remove="(e) => emit('remove', e)"
                       @select="(e) => emit('select', e)"
                       :selected="selected"
                       @click.stop="(e) => onElementClick(e, element, idx)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">

import {generateEntityWithDefault} from "../model/field";
import {ScreenSize} from "../model/page";
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
    elements: any,
    mode?: 'design' | 'view',
    direction: 'row' | 'column',
    parent: string,
    selected: string
}

const props = withDefaults(defineProps<Props>(), {
    screenSize: ScreenSize.desktop,
    elements: [],
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
    'select'
])

function dragStart(event, item, idx) {
    console.log('dragStart', event, item)
    //event.preventDefault();


    event.dataTransfer.setData('item', JSON.stringify(item))
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('from', `${props.parent}.${idx}`)
}

function dragEnd(e) {
    console.log(e)
    dragElement.idx = -1
    dragElement.item = null
}

// function onDrag(e) {
//     console.log('onDrag', e)
//     //let item = <ComponentDropInterface>JSON.parse(e.dataTransfer.getData('item'));console.log(e)
// }

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

        console.log(properties)

        props.elements.push({
            id: (flakeId.generateId()).toString(),
            name: comp.name,
            field: '',
            elements: [],
            layout: {
                [ScreenSize.desktop]: {},
                [ScreenSize.mobile]: {}
            },
            props: properties,
            ...properties
        })
        emit('update:elements', props.elements)
    }
}

function onElementClick(event, element, idx) {
    event.preventDefault()
    console.log(event)
    console.log(element.id)
    emit('select', `${props.parent}.${idx}`)

}

</script>

<style lang="scss">

.drop-zone {
    min-height: 200px;
    display: flex;
    padding: 4px;
    border: #747bff 1px solid;
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
    padding: 8px;
}

</style>