<template>
    <div class="flex flex-col gap-2 overflow-auto">
        <div v-for="(item, idx)  in items"
             :id="item[keyProp]"
             class="flex flex-row items-center cursor-default hover:bg-blue-50 rounded p-3 w-full group"
             @click="emit('update:currentIndex', idx); emit('clicked', idx)"
             @dblclick="emit('doubleClicked', idx)"
             :class="{'bg-blue-100 hover:bg-blue-200': idx === currentIndex || (currentKey && item[keyProp] === currentKey)}"
        >
            <slot name="icon" :item="item" :index="idx">
            </slot>
            <slot name="label" :item="item" :index="idx" class="w-full">
                <span class="text-base w-full">
                    {{item[titleProp]}}
                </span>

            </slot>
            <div class="invisible group-hover:visible">
                <slot name="extra" :item="item"/>
            </div>

        </div>
    </div>

</template>

<script lang="ts" setup>

interface Props {
    items: any[]
    titleProp?: string
    keyProp?:string
    currentIndex?: number
    currentKey?: string | number
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [],
    keyProp: "id",
    titleProp: "title"
})

const emit = defineEmits(['update:currentIndex', 'doubleClicked', 'clicked'])

</script>

<style scoped>

</style>