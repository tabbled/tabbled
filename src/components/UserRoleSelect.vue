<template>
    <el-select multiple @change="changed" :model-value="value">
        <el-option
            v-for="item in roles"
            :key="item.alias"
            :label="item.title"
            :value="item.alias"
        />
    </el-select>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useSocketClient} from "../services/socketio.service";
let socket = useSocketClient()

interface Props {
    modelValue: any[]
}
const emit = defineEmits(['update:modelValue'])

onMounted(async () => {
    await getRoles()
    value.value = props.modelValue
})

watch(() => props.modelValue,() => value.value = props.modelValue)

let props = defineProps<Props>()
let value = ref(null)

let roles = ref([])


const changed = (val) => {
    value.value = val;
    emit('update:modelValue', value.value)
}

async function getRoles() {
    try {
        roles.value = await socket.emit('config/params/get', {id: 'roles'})
    } catch (e) {
        console.error(e)
    }
}
</script>

<style scoped>

</style>