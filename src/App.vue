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
    <Main v-else  :screen-size="screenSize" />

    <DialogView ref="dialogRef"
                 v-model:visible="dialogVisible"
                 :screen-size="screenSize"
                 :options="dialogOptions"/>

    <FirstStartDialog :visible="firstStart" @selected="firstStartSetup"/>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Main from "./pages/Main.vue"
import {onMounted, onUnmounted, ref} from "vue";
import {useStore} from "vuex";
import {DataSourceType} from "./model/datasource";
import {OpenDialogOptions, PageConfigInterface, ScreenSize} from "./model/page";
import {useDataSourceService} from "./services/datasource.service";
import { useFavicon } from '@vueuse/core'
import {useSettings} from "./services/settings.service";
import {useI18n} from 'vue-i18n'
import {useSocketClient} from "./services/socketio.service";
import { defineAsyncComponent } from 'vue'

enum ConfigLoadState {
    NotLoaded = 0,
    Loading,
    Loaded
}

const DialogView = defineAsyncComponent(() =>
    import("./components/DialogView.vue")
)
const FirstStartDialog = defineAsyncComponent(() =>
    import("./pages/configuration/FirstStartDialog.vue")
)
const PageView = defineAsyncComponent(() =>
    import("./pages/PageView.vue")
)

const store = useStore();
const route = useRoute();
const router = useRouter();
const favicon = useFavicon()

let configLoadState = ref<ConfigLoadState>(ConfigLoadState.NotLoaded)
let screenSize = ref(ScreenSize.desktop)

let socketClient = useSocketClient()
const dsService = useDataSourceService();
const settings = useSettings()
let dialogVisible = ref(false)
let dialogOptions = ref()
let dialogRef = ref(null)
let firstStart = ref(false)
let pagesCount = ref(0)
let permissions = {
    admin: false,
    roles: []
}

const { t, locale } = useI18n();

let pagesByAlias = ref<Map<string, PageConfigInterface>>(new Map())

store.subscribe(async (payload) => {
    if (payload.type === 'auth/userLoaded' && configLoadState.value == ConfigLoadState.NotLoaded) {
        await loadConfig()
    }

    if (payload.type === 'auth/loggedOut') {
        configLoadState.value = ConfigLoadState.NotLoaded
        await dsService.clear(DataSourceType.config)
        await dsService.clear(DataSourceType.data)
    }
})

onMounted(async () => {
    await settings.refresh();
    favicon.value = window['env']['appFavicon'] ? window['env']['appFavicon'] : '/favicon.png'

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

    permissions = store.getters['auth/account'].permissions
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    configLoadState.value = ConfigLoadState.NotLoaded
})

function openDialog(options : OpenDialogOptions) {
    dialogOptions.value = options
    dialogVisible.value = true

    return dialogRef
}

function handleResize() {
    screenSize.value = window.innerWidth > 800 ? ScreenSize.desktop : ScreenSize.mobile
}

async function loadConfig() {
    if (configLoadState.value === ConfigLoadState.Loading)
        return

    configLoadState.value = ConfigLoadState.Loading
    try {
        await dsService.registerConfig();
    } catch (e) {
        console.error(e)
    }

    await Promise.all([
        registerPages(),
        dsService.registerAll(),
    ]).then(async () => {
        configLoadState.value = ConfigLoadState.Loaded

        let start = await isFirstStart()
        firstStart.value = !pagesCount.value && start
    }).catch(e => {
        console.error(e)
    })
}

function firstStartSetup() {
    firstStart.value = false
    router.go(0)
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
    pagesCount.value = pages.length

    pages.forEach((item: PageConfigInterface) => {
        addRoute(item.path, item);
    })

    await router.replace(router.currentRoute.value.path)
}

socketClient.socket.on("login_needed", () => {
    console.log('login_needed')
    logout();
})

function canPageAccess(page) {
    if (!permissions) {
        console.warn('No permissions for user')
        return false
    }

    if (permissions.admin)
        return true

    if (!permissions.roles)
        return false

    switch (page.access) {
        case 'all': return true;
        case 'nobody': return false;
        case 'roles':
            return page.accessRoles.some(r=> permissions.roles.includes(r))
        default: return false
    }
}

function addRoute(path: string, page: PageConfigInterface) {
    if (!path || !page)
        return;

    if (!path.startsWith('/')) {
        console.error(`Page ${page.alias} path should start with /`)
        return
    }

    if (!canPageAccess(page))
        return

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

async function isFirstStart() {
    let res = await socketClient.emit('config/params/get', {
        id: '__installedConfig'
    })
    return !res
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
