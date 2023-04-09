console.log('%cWelcome! This application works on Tabbled low-code platform', 'color: green')

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
import Input from "./components/Input.vue";
import LinkSelect from "./components/LinkSelect.vue";
import DateTimeInput from "./components/DateTimeInput.vue";
import ImageField from "./components/ImageField.vue";
import CheckboxField from "./components/CheckboxField.vue";
import {properties as tableProps} from './components/configuration/table.config'
import {properties as checkboxProps } from './components/configuration/checkbox.config'
import {properties as codeEditorProps} from './components/configuration/codeEditor.config'
import {properties as inputProps} from './components/configuration/input.config'
import {properties as linkSelectProps} from './components/configuration/link-select.config'
import {properties as datetimeInputProps} from './components/configuration/datetime-select.config'
import {properties as imageFieldProps} from './components/configuration/image-field.config'

app.component('Icon', Icon)
app.component('Table', Table);
app.component('Input', Input);
app.component('LinkSelect', LinkSelect);
app.component('DateTimeInput', DateTimeInput);
app.component('CodeEditor', CodeEditor)
app.component('ImageField', ImageField)
app.component('CheckboxField', CheckboxField)

let componentService = useComponentService()

componentService.registerComponent({
    name: 'Table',
    title: "Table",
    icon: "mdi:table",
    properties: tableProps(),
    defaultPosition: {
        rows: 1,
        cols: 12
    }
})

componentService.registerComponent({
    name: 'CodeEditor',
    title: "Code editor",
    icon: "fluent:document-javascript-24-regular",
    properties: codeEditorProps(),
    defaultPosition: {
        rows: 4,
        cols: 12
    }
})

componentService.registerComponent({
    name: 'Input',
    title: "Input",
    icon: "mdi:form-textbox",
    properties: inputProps(),
    defaultPosition: {
        rows: 1,
        cols: 12
    }
})

componentService.registerComponent({
    name: 'DateTimeInput',
    title: "Datetime input",
    icon: "mdi:calendar",
    properties: datetimeInputProps(),
    defaultPosition: {
        rows: 1,
        cols: 6
    }
})

componentService.registerComponent({
    name: 'LinkSelect',
    title: "Link select",
    icon: "mdi:form-dropdown",
    properties: linkSelectProps(),
    defaultPosition: {
        rows: 1,
        cols: 6
    }
})

componentService.registerComponent({
    name: 'ImageField',
    title: "Image",
    icon: "mdi:file-image-box",
    properties: imageFieldProps(),
    defaultPosition: {
        rows: 2,
        cols: 3
    }
})

componentService.registerComponent({
    name: 'CheckboxField',
    title: "Checkbox",
    icon: "mdi:checkbox-outline",
    properties: checkboxProps(),
    defaultPosition: {
        rows: 1,
        cols: 2
    }
})

app.use(router(store));
app.use(store)
app.use(ElementPlus)
app.use(i18n)

app.mount("#app");


