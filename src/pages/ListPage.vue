<template>
    <div>Page view {{layoutSize.value}} {{pageConfig.layout[layoutSize.value]}} </div>

    <div ref="grid" class="grid-wrap"
    >


        <div v-for="(element, idx) in pageConfig.layout[layoutSize.value]"
             :id="idx"
             :style="getGridElementStyle(element.position)"
             class="element"
        >
            <component is="Table" v-bind="element.component.properties"></component>
        </div>

    </div>
</template>

<script setup lang="ts">
import {useStore} from "vuex"
import {useSocket} from "../services/socketio.service";
import {onMounted} from "vue";
import {LayoutSize, PageConfigInterface, PositionElementInterface} from "../model/page";

let store = useStore();
let socket = useSocket();

const props = defineProps<{
    pageConfig: PageConfigInterface,
    layoutSize: LayoutSize
}>()

onMounted(() => {
    console.log('onMounted page', props.pageConfig.type )
})

function getGridElementStyle(element:PositionElementInterface) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: '40px'
    }

    if (element.colFrom) {
        let c = String(element.colFrom);
        if (element.colTo) c += ' / ' + element.colTo;
        style.gridColumn = c;
    }
    if (element.rowFrom) {
        let r = String(element.rowFrom);
        if (element.rowTo) r += ' / ' + element.rowTo;
        style.gridRow = r;
    }
    return style;
}

</script>

<style lang="scss">

.grid-wrap {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 10px;
    grid-auto-rows: minmax(40px, auto);
    width: 100%
}

.element {
   background: #535bf2;
    height: 30px;
    width: 100%;
}

</style>