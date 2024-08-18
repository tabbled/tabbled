<template>
    <div style="display: flex; flex-direction: row">


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
        <div v-else class="app-container">
            <SidebarMenu :screen-size="screenSize"/>
            <router-view :screenSize="screenSize" v-slot="{Component}" :style="{ width: viewerWidth, 'max-width': viewerWidth}">
                <component ref="rView" :is="Component" />
            </router-view>
            <RightSidebar :width="rightSidebarWidth"
                          v-if="page.propertiesPanelVisible"
                          ref="rightSidebar"/>
        </div>

    </div>

    <DialogView ref="dialogRef"
                 v-model:visible="dialogVisible"
                 :screen-size="screenSize"
                 :options="dialogOptions"/>

    <FirstStartDialog :visible="firstStart" @selected="firstStartSetup"/>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {computed, ComputedRef, onMounted, onUnmounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {OpenDialogOptions, PageConfigInterface, ScreenSize} from "./model/page";
import {useDataSourceService} from "./services/datasource.service";
import { useFavicon } from '@vueuse/core'
import {useSettings} from "./services/settings.service";
import {useI18n} from 'vue-i18n'
import {useSocketClient} from "./services/socketio.service";
import RightSidebar from "./components/RightSidebar.vue";
import SidebarMenu from "./components/SidebarMenu.vue";
import { useWindowSize } from '@vueuse/core'
import {usePage} from "./store/pageStore";

const DialogView = () => import("./components/DialogView.vue")
const FirstStartDialog = () => import("./pages/configuration/FirstStartDialog.vue")
const PageView = () => import("./pages/PageView.vue")
const ListPageView = () => import("./pages/PageViewV2.vue")

const store = useStore();
const route = useRoute();
const router = useRouter();
const favicon = useFavicon()
const page = usePage()

enum ConfigLoadState {
    NotLoaded = 0,
    Loading,
    Loaded
}

let configLoadState = ref<ConfigLoadState>(ConfigLoadState.NotLoaded)
let screenSize = ref(ScreenSize.desktop)
const { width } = useWindowSize()


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


let rightSidebar = ref(null)
let rightSidebarService = usePage()
let rightSidebarVisible = ref(false)
let rightSidebarPinned = ref(false)
let rightSidebarWidth = ref(300)

const { t, locale } = useI18n();


let pagesByAlias = ref<Map<string, PageConfigInterface>>(new Map())

const viewerWidth: ComputedRef<string> = computed((): string =>  {
    let w = ( width.value - (252 + (rightSidebarVisible.value && rightSidebarPinned.value ? rightSidebarWidth.value : 0)))
    return w + 'px'
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

watch(() => route.path,
    async () => {
        rightSidebarService.closeSetting()
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

// store.subscribe(async (payload) => {
//     console.log(payload)
//     if (payload.type === 'auth/userLoaded' && configLoadState.value == ConfigLoadState.NotLoaded) {
//         await loadConfig()
//     }
//
//     if (payload.type === 'auth/loggedOut') {
//         configLoadState.value = ConfigLoadState.NotLoaded
//         await dsService.clear(DataSourceType.config)
//         await dsService.clear(DataSourceType.data)
//     }

function canPageAccess(page) {
    if (!permissions) {
        console.warn('No permissions for user')
        return false
    }

    if (permissions.admin)
        return true

    if (!permissions.roles)
        return false

    let pagePermissions: { access: string; accessRoles: string[] }

    if (page.permissions) {
        pagePermissions = page.permissions
    } else {
        pagePermissions = {
            access: page.access,
            accessRoles: page.accessRoles
        }
    }

    switch (pagePermissions.access) {
        case 'all': return true;
        case 'nobody': return false;
        case 'roles':
            return pagePermissions.accessRoles.some(r=> permissions.roles.includes(r))
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

    let component = page.type === 'list' ? ListPageView : PageView

    router.addRoute({
        path: path,
        name: page.alias,
        component: component,
        props: {
            pageConfig: page,
            screenSize: screenSize.value,
            openDialog: openDialog,
            //for page v2
            alias: page.alias
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
.app-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
}

.viewer {
    width: v-bind(viewerWidth)
}
</style>
