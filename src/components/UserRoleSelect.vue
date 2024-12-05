<template>
    <el-select multiple @change="changed" :size="size" :model-value="modelValue" style="width: 100%">
        <el-option
            v-for="item in roles"
            :key="item.alias"
            :label="item.title"
            :value="item.alias"
        />
    </el-select>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useSocketClient} from "../services/socketio.service";
let socket = useSocketClient()

interface Props {
    modelValue: any[]
    size: 'small' | 'default'
}
const emit = defineEmits(['update:modelValue'])

onMounted(async () => {
    await getRoles()
    //value.value = props.modelValue
})

//watch(() => props.modelValue,() => value.value = props.modelValue)

let props = defineProps<Props>()
let value = ref(null)

let roles = ref([])


const changed = (val) => {
    console.log(val)
    ///value.value = val;
    emit('update:modelValue', val)
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