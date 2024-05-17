<template>
<div style="padding: 16px">
    <el-page-header ref="mainHeader" style="padding: 0 0 16px 0" @back="$router.back()">
        <template #content>
            <span class="text-large font-600 mr-3"> {{$t('template')}} </span>
        </template>

        <template #extra>
            <div class="page-header-action-panel">
                <el-button @click="cancel">{{$t('cancel')}}</el-button>
                <el-button @click="save" type="primary">{{$t('save')}}</el-button>
            </div>
        </template>
    </el-page-header>

    <el-form label-position="top">
        <div style="display: flex; flex-direction: row; width: 100%">
            <el-form-item :label="$t('title')" style="width: 50%; padding-right: 8px">
                <Input :field-config="getField('title')"
                       field="title"
                       :model-value="getValue('title')"
                       @change="(val) => setValue('title', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('alias')" style="width: 50%">
                <Input :field-config="getField('alias')"
                       field="alias"
                       :model-value="getValue('alias')"
                       @change="(val) => setValue('alias', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('pages')" style="width: 50%; margin-left: 8px">
                <LinkSelect field="pages"
                            :field-config="getField('pages')"
                            key-prop="alias"
                            display-prop="title"
                            :model-value="getValue('pages')"
                            @change="(val) => setValue('pages', val)"
                />
            </el-form-item>

            <el-form-item :label="$t('templateFormat')" style="width: 50%; margin-left: 8px">
                <LinkSelect field="templateFormat"
                            :field-config="getField('templateFormat')"
                            :model-value="getValue('templateFormat')"
                            @change="(val) => setValue('templateFormat', val)"
                            :clearable="false"
                />

            </el-form-item>
        </div>

        <el-tabs v-model="activeTab" class="demo-tabs">

            <el-tab-pane :label="$t('template')" name="template">


                    <el-form-item v-if="getValue('templateFormat')">
                        <el-button text type="primary"  @click="render();">
                            <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                            {{$t('render')}}
                        </el-button>
                        <el-button style="margin-right: 16px"
                                   v-if="getValue('templateFormat') === 'excel'"
                                   text
                                   @click="loadFileExcel">
                            {{$t('loadFile')}}
                        </el-button>

                        <el-checkbox v-if="getValue('templateFormat') === 'excel'"
                                     disabled
                                     :model-value="!!getValue('templateExcel')"
                                     :label="$t('fileLoaded')"/>

                    </el-form-item>


                <CodeEditor v-if="getValue('templateFormat') === 'html'"
                            :context="context"
                            :field-config="getField('template')"
                            field="script"
                            format="html"
                            :model-value="getValue('template')"
                            @change="(val) => setValue('template', val)"
                />

                <div v-if="!getValue('templateFormat')"><span>Please, select the template format</span></div>

            </el-tab-pane>

            <el-tab-pane :label="$t('preparingScript')" name="script">
                <el-form-item>
                    <el-button text type="primary" style="margin-bottom: 8px"  @click="render();">
                        <Icon icon="mdi:play" width="18" style="padding-right: 4px"/>
                        {{$t('run')}}
                    </el-button>
                    <CodeEditor :context="context"
                                :field-config="getField('script')"
                                field="script"
                                format="javascript"
                                :model-value="getValue('script')"
                                @change="(val) => setValue('script', val)"
                    />
                </el-form-item>
            </el-tab-pane>

            <el-tab-pane :label="$t('context')" name="testContext">

                <el-form-item>
                    <CodeEditor :field-config="getField('testContext')"
                                field="testContext"
                                format="json"
                                :runnable="false"
                                :model-value="getValue('testContext')"
                                @change="(val) => setValue('testContext', val)"
                    />
                </el-form-item>

            </el-tab-pane>

        </el-tabs>
    </el-form>


</div>
</template>

<script setup lang="ts">

import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import {computed, ComputedRef, onMounted, ref} from "vue";
import CodeEditor from "../../components/CodeEditor.vue";
import Input from "../../components/Input.vue";
import {generateEntityWithDefault} from "../../model/field";
import {DataSourceInterface} from "../../model/datasource";
import {useDataSourceService} from "../../services/datasource.service";
import {useSocketClient} from "../../services/socketio.service";
import {useSettings} from "../../services/settings.service";
import {useI18n} from 'vue-i18n'
import LinkSelect from "../../components/LinkSelect.vue";
import {base64ArrayBuffer} from '../../utils/base64ArrayBuffer.js'

let router = useRouter();
let route = useRoute()
let reportEntity = ref(null)
let datasource: DataSourceInterface = null
let dsService = useDataSourceService()
let isNew = ref(false)
let activeTab = ref('template')
let pages = ref([])

const { t } = useI18n();

const socket = useSocketClient()
const settings = useSettings()


onMounted(async () => {
    datasource = dsService.reportDataSource
    if (!datasource) {
        console.warn(`Reports datasource doesn't exist`)
    }

    pages.value = (await dsService.pageDataSource.getMany()).data

    await load()
    document.title = `${t('template')} ${ isNew.value ? 'new' : ' ' + reportEntity.value.title } | ${window['env']['appTitle'] ? window['env']['appTitle'] : "Tabbled"}`
});

function getField(alias) {
    if (!datasource)
        return undefined;
    return datasource.getFieldByAlias(alias)
}

async function load() {
    if (!datasource)
        return;

    if (!route.params.id || route.params.id === 'new') {
        reportEntity.value = await generateEntityWithDefault(datasource.fields)
        isNew.value = true
    } else {
        reportEntity.value = await datasource.getById(<string>route.params.id)
        isNew.value = false
    }
}

async function save() {
    try {
        if (isNew.value) {
            let item = await datasource.insert(reportEntity.value.id, reportEntity.value)
            await router.replace({ params: {id: item.id} })
            await load()
        } else {
            await datasource.updateById(reportEntity.value.id, reportEntity.value)
        }

        ElMessage.success(t('saved'))
    }catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

function getValue(alias) {
    if (!reportEntity.value)
        return undefined;

    return reportEntity.value[alias]
}

function setValue(alias, val) {
    if (!reportEntity.value)
        return undefined;

    reportEntity.value[alias] = val
}

async function cancel() {
    router.back()
}

const context: ComputedRef<any> = computed((): any =>  {
    if (!reportEntity.value || !reportEntity.value.context)
        return {}

    try {
        return JSON.parse(reportEntity.value.context)
    }
    catch (e) {
        console.error(e)
        return {}
    }
})

async function render() {
    try {
        let rep = await socket.emit('reports/renderById', {
            id: reportEntity.value.id
        })

        const objectUrl = window.URL.createObjectURL(new Blob([rep], {type: `application/${reportEntity.value.outputFormat}`}));

        if (reportEntity.value.outputFormat === 'excel') {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute('style',"display: none")
            a.href = objectUrl
            a.download = `${reportEntity.value.alias}.xlsx`
            a.click()
        }

        //a.click()
        if (reportEntity.value.outputFormat === 'pdf') {
            window.open(objectUrl)
        }


    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}

async function loadFileExcel() {
    let file = await loadFile()

    if (file) {
        reportEntity.value.templateExcel =   base64ArrayBuffer(file)
    }
}

function loadFile() : Promise<any> {
    return new Promise( (resolve) => {
        let input = document.createElement('input');
        input.type = 'file';
        input.onchange = _ => {
            let files =   Array.from(input.files);
            const fr = new FileReader();
            fr.readAsArrayBuffer(files[0]);
            fr.addEventListener('load', (e) => {
                console.log(e.target)
                resolve(e.target.result)
            })
        };
        input.click();
    })
}


</script>

<style scoped>

</style>