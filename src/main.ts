import { createApp, h } from 'vue'
import App from './App.vue'
import socket from './mixins/socket'
import router from "./router";
import socketioService from "./services/socketio.service";
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

//components
import CodeEditor from "./components/CodeEditor.vue"
import Table from "./components/Table.vue"


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

app.component('Table', Table);
app.component('CodeEditor', CodeEditor)

app.config.globalProperties.$socket = socketioService;
store.$socket = socketioService;

app.use(router(store));
app.use(store)
app.use(ElementPlus)
app.use(i18n)

app.mount("#app");
