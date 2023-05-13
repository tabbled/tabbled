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

app.component('Icon', Icon)

let componentService = useComponentService()
componentService.registerAllComponents(app)

app.use(router(store, useSettings()));
app.use(store)
app.use(ElementPlus)
app.use(i18n)

app.mount("#app");


