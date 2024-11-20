<template>
    <div class="flex flex-col gap-2">
        <div v-for="(item, idx)  in items "
             :id="item[keyProp]"
             class="flex flex-row items-center cursor-default hover:bg-blue-50 rounded p-3"
             @click="emit('update:currentIndex', idx); emit('clicked', idx)"
             @dblclick="emit('doubleClicked', idx)"
             :class="{'bg-blue-100': idx === currentIndex, 'hover:bg-blue-200': idx === currentIndex}"
        >
            <slot name="icon" :item="item" :index="idx">
            </slot>
            <slot name="label" :item="item" :index="idx" class="w-full">
                <span class="text-base">
                    {{item[titleProp]}}
                </span>

            </slot>
        </div>
    </div>

</template>

<script lang="ts" setup>

interface Props {
    items: any[]
    titleProp?: string
    keyProp?:string
    currentIndex?: number
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