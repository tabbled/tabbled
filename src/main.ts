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
import TreeFilter from "./components/TreeFilter.vue";
import FlexLayout from "./components/FlexLayout.vue";
import * as Sentry from "@sentry/vue";

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
app.component('TreeFilter', TreeFilter)
app.component('FlexLayout', FlexLayout)

let componentService = useComponentService()
componentService.registerAllComponents()

const routerInst = router(store)

app.use(i18n)
app.use(routerInst);
app.use(store)
app.use(ElementPlus)

Sentry.init({
    app,
    //@ts-ignore
    dsn: import.meta.env.MODE === 'development' ? import.meta.env.VITE_SENTRY_DNS : window['env']['sentryDns'],
    integrations: [
        new Sentry.BrowserTracing({
            // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
            tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
            routingInstrumentation: Sentry.vueRouterInstrumentation(routerInst),
        }),
        new Sentry.Replay(),
    ],
    //@ts-ignore
    environment: import.meta.env.MODE,
    // Performance Monitoring
    tracesSampleRate: 0.3, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});



app.mount("#app");


