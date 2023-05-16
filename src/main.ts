import {useSettings} from "./services/settings.service";

console.log('%cWelcome! This application works on Tabbled low-code platform', 'color: green')

import { createApp, h } from 'vue'
import App from './App.vue'
import router from "./router";
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import { Icon } from "@iconify/vue"
import ru from './locales/ru.json'
import en from './locales/en.json'
import { createI18n } from 'vue-i18n'
import {useComponentService} from "./services/component.service";
import Table from "./components/Table.vue";
import CodeEditor from "./components/CodeEditor.vue";
import LinkSelect from "./components/LinkSelect.vue";
import CheckboxField from "./components/CheckboxField.vue";
import Input from "./components/Input.vue";
import DateTimeInput from "./components/DateTimeInput.vue";
import ImageField from "./components/ImageField.vue";
import StatusFilter from "./components/StatusFilter.vue";
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

app.component('Icon', Icon)
app.component('Table', Table);
app.component('CodeEditor', CodeEditor)
app.component('LinkSelect', LinkSelect)
app.component('CheckboxField', CheckboxField)
app.component('Input', Input);
app.component('DateTimeInput', DateTimeInput);
app.component('ImageField', ImageField)
app.component('StatusFilter', StatusFilter)

let componentService = useComponentService()
componentService.registerAllComponents(app)

app.use(router(store, useSettings()));
app.use(store)
app.use(ElementPlus)
app.use(i18n)

app.mount("#app");


