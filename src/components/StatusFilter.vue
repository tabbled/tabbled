<template>

    <div v-if="fieldConfig && multiple">
        <el-checkbox-group v-model="value" size="small" @change="changeMultiple">
            <el-checkbox-button v-for="item in listValues" :key="item.key" :label="item.title">
                {{ item.title }}
            </el-checkbox-button>
        </el-checkbox-group>
    </div>
    <div v-else-if="fieldConfig">
        <div>
            <el-radio-group v-model="value" size="small" @change="changeSingle">
                <el-radio-button v-for="item in listValues" :key="item.key" :label="item.title"/>
            </el-radio-group>
        </div>
    </div>


</template>

<script setup lang="ts">

import {onMounted, ref, watch} from "vue";
import {FieldConfigInterface} from "../model/field";
import {Filters} from "../model/filter";
import {useDataSourceService} from "../services/datasource.service";
let dsService = useDataSourceService()

interface Props {
    id: string
    modelValue?: any,
    field?: string,
    fieldConfig: FieldConfigInterface,
    multiple?: boolean,
    filters?: Filters
}

const props = withDefaults(defineProps<Props>(), {
    multiple: false
})

const emit = defineEmits(['update:modelValue', 'change'])

let value = ref(props.multiple ? [] : null)
let listValues = ref([])

onMounted(async () => {
    await init()
    await getValue()
})

watch(() => props.modelValue,
    async () => {
        await getValue()
    })

watch(() => props.fieldConfig,
    async () => {
        await init()
})

async function init() {
    if (props.fieldConfig.type == 'link') {
        let dataSource = await dsService.getByAlias(props.fieldConfig.datasource)

        if (!dataSource) {
            console.warn(`Link source "${props.fieldConfig.datasource}" for field "${props.fieldConfig.alias}" not found`)
            return
        }

        let v = await dataSource.getMany({
            fields: ['id', 'name'],
            take: 20
        })

        listValues.value = v.data.map(i => { return { key: i.id, title: i.name }  })

    } else if (props.fieldConfig.type === 'enum') {
        if (props.fieldConfig.values instanceof Function) {
            listValues.value =  await props.fieldConfig.values()
        } else
            listValues.value = props.fieldConfig.values
    }
    await getValue()
}

function getValue() {

}

// Element plus can't use key and stores checked value by title
function getKeyByTitle(title) {
    for(let i in listValues.value) {
        if (listValues.value[i].title === title) {
            return listValues.value[i].key
        }
    }
    return null
}


function changeMultiple() {
    change(getMultipleValue())
}

function getMultipleValue() {
    let items = []
    for(let i in value.value) {
        items.push(getKeyByTitle(value.value[i]))
    }
    return items
}

function changeSingle(val) {
    change(getKeyByTitle(val))
}


function change(event: any) {
    emit('update:modelValue', event)
    emit('change', event)

    if (!props.filters) {
        console.warn('No filters')
        return
    }

    if ((props.multiple && !value.value.length) || value.value === null) {
        props.filters.setFilter(props.id, null)
        return
    }

    props.filters.setFilter(props.id, {
        key: props.fieldConfig.alias,
        op: props.multiple ? 'in' : '==',
        compare: props.multiple ? getMultipleValue() : getKeyByTitle(value.value)
    })
}

</script>

<style lang="scss">

</style>