<template>
    <el-container class="main">
        <el-container>
            <el-aside :width="isCollapsed ? '64px' : '250px'" ref="aside">
                <el-header height="auto" style="margin: 16px; --el-header-padding: 0">
                    <div class="menu-header">
                        <div>
                            <el-row align="middle">
                                <img height="30" src="./../assets/tabbled_icon.svg" alt=""/>
                                <div style="margin-left: 8px">Tabbled</div>
                            </el-row>
                        </div>
                        <el-tag v-if="!isConnected" effect="light" size="small" type="danger">Offline</el-tag>
                    </div>
                </el-header>
                <el-divider style="margin: 0"/>

                <el-menu style="height: 400px"
                         :collapse="isCollapsed"
                         :collapse-transition="false"
                         :default-active="$route.fullPath"
                         :router="true"
                >
                    <div v-for="menu in sidebarMenu" :key="menu.id">
                        <el-sub-menu v-if="menu.items"
                                     :index="menu.id"
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

                            <span style="width: 100%; text-align: start;">{{username}}</span>
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
                    <el-main v-if="isConfigLoaded" :style="{height: mainViewHeight + 'px'}">
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
import {MenuConfigInterface} from "../model/menu";
import {useStore} from "vuex";
import {useRouter, useRoute} from 'vue-router'
import {useI18n} from 'vue-i18n'
import {useSocketClient} from '../services/socketio.service'
import {LayoutSize, PageConfigInterface} from "../model/page";
import ListPage from "./ListPage.vue";
import NotFound from "./NotFound.vue"
import { usePagesActions } from "../services/page.service"
import { useDataSourceService } from "../services/datasource.service";
import { useDatabase } from "../services/database.service";


const props = defineProps<{

}>()

const mainContainer = ref(null);
const mainHeader = ref(null);
const rView = ref(null)

let layoutSize = ref(LayoutSize.large)

let mainViewHeight = ref(0)
let isCollapsed = ref(localStorage.getItem('is_menu_collapsed') === 'true')

let pagesByAlias = ref<Map<string, PageConfigInterface>>(new Map())

let isConfigLoaded = ref(false)

const store = useStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const pagesActions = usePagesActions();
const dsService = useDataSourceService();
const db = useDatabase();




let socketClient = useSocketClient()
let isConnected = ref(socketClient.socket.connected)

socketClient.socket.on("connect", () => {
    isConnected.value = true;
})

socketClient.socket.on("disconnect", () => {
    isConnected.value = false;
})

socketClient.socket.on("login_needed", () => {
    logout();
})

let sidebarMenu = ref<Array<MenuConfigInterface>>(null)

function setCollapsed() {
    isCollapsed.value = !isCollapsed.value;
    localStorage.setItem('is_menu_collapsed', isCollapsed.value ? 'true' : 'false')
}

onMounted(() => {
    console.log('Main mounted')
    mainViewHeight.value = mainContainer.value.$el.clientHeight - mainHeader.value.$el.clientHeight;
    window.addEventListener('resize', handleResize);
    handleResize();

    isConfigLoaded.value = false;
    loadConfig();
})

onUnmounted(() => {
    console.log('Main unmounted')
    window.removeEventListener('resize', handleResize);
    isConfigLoaded.value = false;
})


function handleResize() {
    layoutSize.value = window.innerWidth > 800 ? LayoutSize.large : LayoutSize.small
}

// store.subscribe((mutation: any) => {
//     if (mutation.type === 'config/loaded') {
//         loadConfig();
//     }
//
//     if (mutation.type === 'auth/loggedOut') {
//         database.close();
//     }
// });

async function loadConfig() {
    await db.open(store.getters["auth/account"]);
    try {
        await db.sync('config')
    } catch (e) {
        console.error(e)
    }

    // Preparing interface and modules by config
    Promise.all([
        loadMenu(),
        dsService.registerAll(),
        registerPages()
    ]).then(() => {
        isConfigLoaded.value = true;
    }).catch(e => {
        console.error(e)
    })
}

async function registerPages() {
    pagesByAlias.value.clear()

    await db.database.ref('config/page').forEach(data => {
        if (!data.val().deletedAt) {
            let config = data.val().data
            addRoute(config.path, config);
        }
    })
}

function getComponentByName(name: string) {
    switch (name) {
        //case 'EditPage': return EditPage
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
            title: `${page.title} | Tabbled`
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

const username: ComputedRef<string> = computed((): string =>  {
    //console.log(store.getters['auth/user'])
    return store.getters['auth/user'] ? store.getters['auth/user'].username : ""
})

function openInNewWindow(to: string) {
    let route = router.resolve({path: to});
    window.open(route.href);
}


async function loadMenu() {
    await db.database.ref('config/menu').forEach(config => {
        console.log('Sidebar menu populated')
        if (!sidebarMenu.value)
            sidebarMenu.value = config.val().data
    })
}

function logout() {
    store.dispatch('auth/logout')
        .then(() => {
            router.push('/login')
        })
}

</script>

<style lang="scss">

.open_new {
    color: var(--el-border-color);
    border-radius: unset;
    align-content: center;
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

.menu-header {
    justify-content: space-between;
    display: flex;
    align-items: center;
}

</style>