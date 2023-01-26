import { createApp, h } from 'vue'
import App from './App.vue'
import router from "./router";
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

// i18n
import ru from './locales/ru.json'
import en from './locales/en.json'
import { createI18n } from 'vue-i18n'
import {useComponentService} from "./services/component.service";
const i18n = createI18n({
    messages: {
        ru: ru,
        en: en
    },
    locale: 'en',
    fallbackLocale: 'en',
    globalInjection: true,
    mode: 'composition',
    legacy: false,
    globals: true
})

const app = createApp({
    render: () => h(App)
})

//components
import { Icon } from "@iconify/vue"
import CodeEditor from "./components/CodeEditor.vue"
import Table from "./components/Table.vue"
import DataSetActionPanel from './components/DataSetActionPanel.vue'
import {properties as actionPanelProps} from "./components/configuration/dataSetActionPanel.config";
import {properties as tableProps} from './components/configuration/table.config'

app.component('Icon', Icon)
app.component('Table', Table);
app.component('CodeEditor', CodeEditor)
app.component('DataSetActionPanel', DataSetActionPanel)

let componentService = useComponentService()
componentService.registerComponent({
    name: 'DataSetActionPanel',
    title: "Action panel",
    properties: actionPanelProps()
})
componentService.registerComponent({
    name: 'Table',
    title: "Table",
    properties: tableProps()
})

app.use(router(store));
app.use(store)
app.use(ElementPlus)
app.use(i18n)

app.mount("#app");
