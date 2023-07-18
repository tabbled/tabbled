<template>
    <div v-if="route.meta.isSingle" style="width: 100vw" >
        <router-view />
    </div>
    <div v-else-if="configLoadState !== ConfigLoadState.Loaded" style="width: 30vw; margin: auto">
        <el-progress
            status="success"
            :indeterminate="true"
            :duration="1"
            :percentage="100"
        />
        <div>{{$t('loading')}}</div>
    </div>
    <Main v-else :screen-size="screenSize" />

    <DialogView  v-model:visible="dialogVisible"
                 :screen-size="screenSize"
                 :options="dialogOptions"/>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Main from "./pages/Main.vue"
import {onMounted, onUnmounted, ref} from "vue";
import {useStore} from "vuex";
import {DataSourceType} from "./model/datasource";
import {PageConfigInterface, ScreenSize} from "./model/page";
import {useDataSourceService} from "./services/datasource.service";
import {useDatabase} from "./services/database.service";
import {useSyncService} from "./services/sync.service";
import PageView from "./pages/PageView.vue";
import { useFavicon } from '@vueuse/core'
import {useSettings} from "./services/settings.service";
import {useI18n} from 'vue-i18n'
import DialogView from "./components/DialogView.vue";

enum ConfigLoadState {
    NotLoaded = 0,
    Loading,
    Loaded
}


const store = useStore();
const route = useRoute();
const router = useRouter();
const favicon = useFavicon()

let configLoadState = ref<ConfigLoadState>(ConfigLoadState.NotLoaded)
let screenSize = ref(ScreenSize.desktop)

const dsService = useDataSourceService();
const db = useDatabase();
const syncService = useSyncService()
const settings = useSettings()
let dialogVisible = ref(false)
let dialogOptions = ref()

const { t, locale } = useI18n();

let pagesByAlias = ref<Map<string, PageConfigInterface>>(new Map())

store.subscribe(async (payload) => {
    if (payload.type === 'auth/userLoaded' && configLoadState.value == ConfigLoadState.NotLoaded) {
        console.log('auth/userLoaded')
        await loadConfig()
    }

    if (payload.type === 'auth/loggedOut') {
        configLoadState.value = ConfigLoadState.NotLoaded
        await db.close()
        await dsService.clear(DataSourceType.config)
        await dsService.clear(DataSourceType.data)
    }
})

onMounted(async () => {
    console.log('App mounted')

    await settings.refresh();
    favicon.value = settings.favicon

    let user = store.getters["auth/user"]
    if (user && user.settings && user.settings.lang) {
        locale.value = user.settings.lang
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    configLoadState.value = ConfigLoadState.NotLoaded



    if (store.getters["auth/isAuthenticated"]) {
        try {
            await store.dispatch('auth/loadUserSettings')
        } catch (e) {
            console.error(e)
            //logout()
        }

        await loadConfig()
    }
})

onUnmounted(() => {
    console.log('App unmounted')
    window.removeEventListener('resize', handleResize);
    configLoadState.value = ConfigLoadState.NotLoaded
})

function openDialog(options) {
    console.log(options)
    dialogOptions.value = options
    dialogVisible.value = true
}

function handleResize() {
    screenSize.value = window.innerWidth > 800 ? ScreenSize.desktop : ScreenSize.mobile
}

async function loadConfig() {
    console.log('loadConfig', configLoadState.value)
    if (configLoadState.value === ConfigLoadState.Loading)
        return

    configLoadState.value = ConfigLoadState.Loading
    try {
        await db.open(store.getters["auth/account"], store.getters["auth/user"]);
        await dsService.registerConfig();
        await syncService.sync(DataSourceType.config)
    } catch (e) {
        console.error(e)
    }

    await Promise.all([
        registerPages(),
        dsService.registerAll(),
    ]).then(() => {
        configLoadState.value = ConfigLoadState.Loaded
    }).catch(e => {
        console.error(e)
    })
}

function logout() {
    store.dispatch('auth/logout')
        .then(() => {
            router.push('/login')
        })
}

async function registerPages() {
    pagesByAlias.value.clear()

    let pages = (await dsService.pageDataSource.getMany()).data

    pages.forEach((item: PageConfigInterface) => {
        addRoute(item.path, item);
    })

    await router.replace(router.currentRoute.value.path)
}

function addRoute(path: string, page: PageConfigInterface) {
    if (!path || !page)
        return;

    if (!path.startsWith('/')) {
        console.error(`Page ${page.alias} path should start with /`)
        return
    }

    router.addRoute({
        path: path,
        name: page.alias,
        component: PageView,
        props: {
            pageConfig: page,
            screenSize: screenSize.value,
            openDialog: openDialog
        },
        meta: {
            isSingle: false,
            authRequired: true,
            title: page.title
        }
    })
    pagesByAlias.value.set(path, page);
    console.info('Route ' + path + ' added')
}

</script>


<style lang="scss">
html,
body {
    font-family: "Noto Sans", Inter, Roboto, sans-serif;
    min-height: 100vh;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#app {
    text-align: start !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100vw;
}

</style>
