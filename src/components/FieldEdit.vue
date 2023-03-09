<template>
    <div>Field edit {{modelValue.alias}}</div>
</template>

<script setup lang="ts">

import {FieldConfigInterface} from "../model/field";

const props = defineProps<{
    modelValue: FieldConfigInterface
}>()

const emit = defineEmits(['update:modelValue'])



</script>

<style scoped>

</style>