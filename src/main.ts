import { createApp, h } from 'vue'
import './style.css'
import App from './App.vue'
import socket from './mixins/socket'
import { router } from "./router";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// i18n
import ru from './locales/ru.json'
import en from './locales/en.json'
import { createI18n } from 'vue-i18n'
const i18n = createI18n({
    messages: {
        ru: ru,
        en: en
    },
    locale: 'en',
    fallbackLocale: 'en',
    globalInjection: true
})

const app = createApp({
    mixins: [
        socket
    ],
    render: () => h(App)
})

app.use(router);
app.use(ElementPlus)
app.use(i18n)

app.mount("#app");
