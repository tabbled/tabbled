<template>
    <div>Page view {{pageConfig.layout?.large[0].position}}</div>

    <div ref="grid" class="grid-wrap"
    >

        <div v-for="(element, idx) in pageConfig.layout[layoutSize]"
             :id="idx"
             :style="getGridElementStyle(element.position)"
             class="element"
        >
        </div>

    </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex"
import { useSocket } from "../services/socketio.service";
import {onMounted, ref, defineProps} from "vue";
import {PageConfigInterface, LayoutSize, PositionElementInterface} from "../model/page";

let store = useStore();
let socket = useSocket();

let layoutSize = ref(LayoutSize.large)

const props = defineProps<{
    pageConfig: PageConfigInterface
}>()

onMounted(() => {
    console.log('onMounted page', props.pageConfig.layout?.large[0].position)

})

function getGridElementStyle(element:PositionElementInterface) {
    let style = {
        gridColumn: "1 / auto",
        gridRow: "1 / auto",
        height: '40px'
    }

    console.log(element)

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
    grid-template-rows: repeat(10, 1fr);
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