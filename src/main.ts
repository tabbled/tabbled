import { createApp, h } from 'vue'
import './style.css'
import App from './App.vue'
import socket from './mixins/socket'
import lang from './mixins/lang'

const app = createApp({
    mixins: [
        socket,
        lang
    ],
    render: () => h(App)
})

app.mount("#app");
