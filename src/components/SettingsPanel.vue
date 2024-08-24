<template>
    <el-form v-if="pageStore.propertiesHelper" class="settings-panel-form" label-position="top" :model="pageStore.propertiesHelper.props" size="small" >

            <el-collapse v-model="activeGroups" style="border-top: unset">
                <el-collapse-item v-for="group in groupedProps" :title="group.title" :name="group.key">
                    <template #title>
                        <div class="group-title">{{t(group.title)}}</div>
                    </template>

                    <el-form-item  v-for="(prop, idx)  in group.props"
                                   class="settings-panel-form-item"
                                   :tabindex="idx"
                                   :show-message="false"
                                   >
                        <template #label>
                            <PropertyTitle v-if="!['checkbox', 'dataset-list', 'event-handler-list'].includes(prop.editor)" :title="t(prop.title)" :tooltip="prop.tooltip ? t(prop.tooltip) : undefined"/>
                        </template>


                        <el-input v-if="prop.editor === 'input' && prop.format === 'string'"
                                  clearable
                                  size="small"
                                  :model-value="getValue(prop.path)"

                                  @input="e => onChange(prop.path, e)"/>

                        <el-input-number v-if="prop.editor === 'input' && prop.format === 'number'"
                                         clearable
                                         size="small"
                                         :controls="false"
                                         :model-value="getValue(prop.path)"
                                         @input="e => onChange(prop.path, e)"/>

                        <Select v-if="prop.editor === 'select'"
                                :items="prop.items"
                                :model-value="getValue(prop.path)"
                                @change="e => onChange(prop.path, e)"

                        />

                        <el-checkbox v-else-if="prop.editor === 'checkbox'"
                                     :label="t(prop.title)"
                                     :model-value="getValue(prop.path)"
                                     @change="e => onChange(prop.path, e)"/>

                        <DataSetList v-else-if="prop.editor === 'dataset-list'"
                                     :label="t(prop.title)"
                                     @change="e => onChange(prop.path, e)"
                                     :items="getValue(prop.path)"
                        />

                    </el-form-item>

                </el-collapse-item>
            </el-collapse>




    </el-form>
</template>

<script setup lang="ts">

import {ref, onMounted, onBeforeMount} from "vue";
import {usePage} from "../store/pageStore";
import Select from "./controls/Select.vue";
import _ from "lodash"
import {PropertyDef} from "../model/component";
import PropertyTitle from "./controls/PropertyTitle.vue";
import {useI18n} from "vue-i18n"
import DataSetList from "./controls/DataSetList.vue";
const {t, setLocaleMessage, availableLocales} = useI18n({
   useScope: "local"
})



let activeGroups = ref<string[]>([])

const emit = defineEmits<{
    (e: 'update:property', prop: string, value: any): string
}>()

let pageStore = usePage()

class GroupedProperties {
    key: string
    title: string
    props: PropertyDef[]
}
let groupedProps = ref<GroupedProperties[]>([])


pageStore.$onAction(
    ({
         name,
         after
     }) => {


        after(() => {
            if (name === 'openSettings')
                init()
            console.log('after', name)
            console.log()
        })
    })

const init = async () => {
    if (pageStore.propertiesHelper.locales) {
        availableLocales.forEach(locale => {
            setLocaleMessage(locale as string, pageStore.propertiesHelper.locales[locale as string])
        })
    }


    populateProps()
    activeGroups.value = pageStore.propertiesHelper.groups.map(g => g.key)
}

const populateProps = () => {
    groupedProps.value = pageStore.propertiesHelper.groups.map(g => {
        return {
            key: g.key,
            title: g.title,
            props: pageStore.propertiesHelper.propertiesDef().filter(p => p.group === g.key && (_.has(p, 'visible') ? p.visible() : true))
        }
    })
}

let onChange = (path: string, value: any) => {
    console.log('onChange', path)
    pageStore.setProperty(path, value)
    populateProps()
}

const getValue = (path: string) => {
    return _.has(pageStore.propertiesHelper.props, path) ? _.get(pageStore.propertiesHelper.props, path) : null
}


onMounted(() => init())

onBeforeMount(() => {

})


</script>

<style lang="scss">

.settings-panel-form {
    margin: 0;
}

.settings-panel-form-item {
    margin: 0 16px;
}

.form-item-group {
    padding: 0 16px;
}

.el-form-item--small {
    margin-bottom: 10px !important;
}

.group-title {
    margin: 0 16px;
}

.el-collapse-item__header {
    height: 38px !important;
    overflow: hidden;
}

.el-collapse-item__content {
    padding-bottom: 8px !important;
}


</style>