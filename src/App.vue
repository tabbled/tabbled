<template>
    <div v-if="$route.meta.isSingle" class="single-page" >
        <router-view />
    </div>


    <el-container v-else class="main">
        <el-container>
            <el-aside :width="isCollapsed ? '64px' : '250px'" ref="aside">
                <el-header height="auto" style="margin: 16px; --el-header-padding: 0">
                    <el-col >
                        <el-row align="middle">
                            <img height="30" src="./assets/tabbled_icon.svg" alt=""/>
                            <div v-if="!isCollapsed" style="margin-left: 8px">Tabbled</div>
                        </el-row>
                    </el-col>

                </el-header>
                <el-divider style="margin: 0"/>

                    <el-menu style="height: 400px"
                        :collapse="isCollapsed"
                        :collapse-transition="false"
                        :default-active="$route.fullPath"
                        :router="true"
                    >
                        <div v-for="menu in sidebarMenu" :key="menu._id">
                            <el-sub-menu v-if="menu.items"
                                         :index="menu._id"
                            >
                                <template #title>
                                    <el-icon class="iconify" :data-icon="'mdi:'+menu.icon" style="width: 18px; height: 18px; margin-right: 8px"></el-icon>
                                    <span v-if="!isCollapsed">{{menu.title}}</span>
                                </template>

                                <el-menu-item v-for="item in menu.items"
                                              :key="item.id"
                                              :index="item.path">
                                    <template #title>
                                        <span  style="width: 100%; text-align: left;">{{ item.title }}</span>
                                        <div @click="$event.stopPropagation(); openInNewWindow(item.path);" class="open_new" style="width: 16px; height: 100%;">
                                            <el-icon class="iconify " data-icon="mdi:open-in-new" style="width: 16px; height: 100%;"/>
                                        </div>
                                    </template>

                                </el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else :index="menu.path" >
                                <el-icon class="iconify" :data-icon="'mdi:'+menu.icon" style="width: 18px; height: 18px; margin-right: 8px"/>
                                <template #title>
                                    <span>{{menu.title}}</span>
                                </template>
                            </el-menu-item>
                        </div>
                    </el-menu>

                <div class="footer ">
                    <el-menu
                             :collapse="isCollapsed"
                             :collapse-transition="false"
                    >

                        <el-menu-item index="1">
                            <el-icon class="iconify" data-icon="mdi:user" style="width: 24px; height: 24px; margin-right: 8px"/>

                            <span style="width: 100%; text-align: start;">{{username()}}</span>
                            <div v-if="!isCollapsed" @click="logout()" class="open_new" style="width: 16px; height: 100%;">
                                <span class="iconify " data-icon="mdi:exit-to-app" style="width: 24px; height: 100%;"/>
                            </div>
                        </el-menu-item>


                        <div style="width: 100%;">
                            <el-button @click="setCollapsed" text style="width: 64px; opacity: 40%" size="small">
                                <span class="iconify " :data-icon="isCollapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'" style="width: 24px; height: 100%;"/>
                            </el-button>
                        </div>


                    </el-menu>
                </div>
            </el-aside>
            <el-container >
                <el-col class="main-router-view" ref="mainContainer" :style="{width: isCollapsed ? 'calc(100% - 64px)' :'calc(100% - 250px)' }">
                    <el-page-header ref="mainHeader" class="page-header" @back="$router.back()">
                        <template #content>
                            <span class="text-large font-600 mr-3"> {{currentPageTitle}} </span>
                        </template>

                        <template #extra>
                            <div class="flex items-center">

                                <el-button v-for="action in pagesActions.buttons"
                                           :type="action.type ? action.type : 'default'"
                                           @click="action.func()"
                                >
                                    {{action.title}}
                                </el-button>
                            </div>
                        </template>
                    </el-page-header>
                    <el-main :style="{height: mainViewHeight + 'px'}">
                            <router-view :layoutSize="layoutSize" v-slot="{Component}">
                                <component ref="rView" :is="Component" />
                            </router-view>


                    </el-main>
                </el-col>
            </el-container>
        </el-container>
    </el-container>
<!--    <div class="locale-changer">-->
<!--        <select v-model="$i18n.locale">-->
<!--            <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>-->
<!--        </select>-->
<!--    </div>-->
</template>

<script setup lang="ts">
import {computed, ComputedRef, onMounted, onUnmounted, ref} from "vue";
import {MenuConfigInterface} from "./model/menu";
import {useStore} from "vuex";
import {useRouter, useRoute} from 'vue-router'
import {useI18n} from 'vue-i18n'
import {useSocket} from './services/socketio.service'
import {ElNotification} from 'element-plus'
import {LayoutSize, PageConfigInterface} from "./model/page";
import EditPage from "./pages/EditPage.vue";
import ListPage from "./pages/ListPage.vue";
import NotFound from "./pages/NotFound.vue"
import { usePagesActions } from "./services/page.service"
import {useDataSourceService} from "./services/datasource.service";

const props = defineProps<{

}>()

const mainContainer = ref(null);
const mainHeader = ref(null);
const rView = ref(null)

let layoutSize = ref(LayoutSize.large)

let mainViewHeight = ref(0)
let isCollapsed = ref(localStorage.getItem('is_menu_collapsed') === 'true')

let pagesByAlias = ref<Map<string, PageConfigInterface>>(new Map())

const store = useStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const pagesActions = usePagesActions()
const dsService = useDataSourceService()



let socketio = ref({
    initiated: false,
    error_message: "",
    isConnected: false,
    connectionCount: 0
})
let socket  = useSocket()
initSocketIO()

let sidebarMenu = ref<Array<MenuConfigInterface>>([])

function setCollapsed() {
    isCollapsed.value = !isCollapsed.value;
    localStorage.setItem('is_menu_collapsed', isCollapsed.value ? 'true' : 'false')
}

onMounted(() => {
    console.log('App mounted')
    mainViewHeight.value = mainContainer.value.$el.clientHeight - mainHeader.value.$el.clientHeight;
    window.addEventListener('resize', handleResize);
    handleResize();

    if (store.getters['config/isLoaded']) {
        loadMenu()
        dsService.registerAll(store)
        registerPages()
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
})

function handleResize() {
    layoutSize.value = window.innerWidth > 800 ? LayoutSize.large : LayoutSize.small
}

store.subscribe((mutation: any) => {
    if (mutation.type === 'config/loaded') {
        loadMenu()
        dsService.registerAll(store)
        registerPages()
    }
});

function registerPages() {
    pagesByAlias.value.clear()

    store.getters['config/pages'].forEach((config:PageConfigInterface) => {
        addRoute(config.path, config);
    })
}

function getComponentByName(name: string) {
    switch (name) {
        case 'EditPage': return EditPage
        case 'ListPage': return ListPage
    }
    return NotFound
}

function addRoute(path: string, page: PageConfigInterface) {
    router.addRoute({
        path: path,
        component: getComponentByName(page.component),
        props: {
            pageConfig: page,
            layoutSize: layoutSize.value
        },
        meta: {
            isSingle: false,
            authRequired: true,
            title: `Tabbled | ${page.title}`
        }
    })
    pagesByAlias.value.set(path, page);
    console.info('Route ' + path + ' added')

    if (path === router.currentRoute.value.path) {
        router.replace(path)
    }
}

const currentPageTitle: ComputedRef<string> = computed((): string =>  {
    const page = pagesByAlias.value.get(router.currentRoute.value.path);
    return page ? page.title : ""
})


function username(): string {
    return store.getters['auth/user'] ? store.getters['auth/user'].username : ""
}

function openInNewWindow(to: string) {
    let route = router.resolve({path: to});
    window.open(route.href);
}


function loadMenu() {
    sidebarMenu.value = Object.assign([], store.getters['config/sidebarMenu'])
}

function logout() {
    store.dispatch('auth/logout')
        .then(() => {
            socketio.value.connectionCount = 0
            router.push('/login')
        })
}

function initSocketIO() {
    //No need to re-subscribe
    if (socketio.value.initiated) {
        return;
    }
    socketio.value.initiated = true;


    socket.on("exception", (err) => {
        console.error(err);
    });

    socket.on("connect_error", (err) => {
        console.error(`!!!Failed to connect to the backend. Socket.io connect_error: ${err.message}`);
        socketio.value.error_message = `Cannot connect to the socket server. [${err}] Reconnecting...`;
        socketio.value.isConnected = false;
    });

    socket.on("disconnect", () => {
        socketio.value.isConnected = false;

        if (store.getters['auth/isAuthenticated'])
            ElNotification.warning({
                title: 'Disconnected',
                message: "Lost connection to the server",
                showClose: true,
            })
    });

    socket.on("connect", async () => {
        console.log("Connected to the socket server");
        socketio.value.connectionCount++
        socketio.value.isConnected = true;

        if (store.getters['auth/isAuthenticated']) {


            if (socketio.value.connectionCount > 1)
                ElNotification.success({
                    title: 'Connected',
                    message: "Connected to the server",
                    showClose: true,
                    type: 'success',
                })

            await store.dispatch('auth/loadUserSettings');
            await store.dispatch('config/load');
        }

    });

    //When the server decided that token is not valid or expired
    socket.on("login_needed", () => {
        router.push('/login');
    })
}


</script>

<style lang="scss">

.open_new {
    color: var(--el-border-color);
    border-radius:unset;
    align-content: center;
}

.single-page {
    margin: auto;
    width: 100vw;
}

.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 250px;
}

.page-header {
    margin: 16px;
}

.main {
    margin: 0;
    padding: 0;
    width: 100vw;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    .el-menu {
        border-right: none;
    }
}

.main-router-view {
    box-shadow: var(--el-box-shadow-light);
    z-index: 100;
    height: 100%;
    position: absolute;
    overflow: hidden
}

.el-sub-menu__title {
    height: 40px !important;
    line-height: 40px !important;
}

.el-sub-menu .el-menu-item {
    height: 40px !important;
    line-height: 40px !important;
}

.el-menu-item {
    height: 40px !important;
    line-height: 40px !important;
}



html,
body {
    font-family: "Noto Sans", Inter, Roboto, Avenir, Helvetica, sans-serif;
    min-height: 100vh;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#app {
    text-align: start !important;
    padding: 0 !important;
    margin: 0 !important;
}

</style>
