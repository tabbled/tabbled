<template>
    <el-container class="main">
        <el-container>
            <el-aside :width="isSideBarCollapsed ? '64px' : mainSideBarWidth + 'px'" ref="aside">
                <el-header height="auto" style="margin: 16px; --el-header-padding: 0">
                    <div class="menu-header">
                        <div>
                            <el-row align="middle">
                                <img height="30" :src="favicon" alt=""/>
                                <div v-if="!isSideBarCollapsed" style="margin-left: 8px">{{title}}</div>
                            </el-row>
                        </div>
                        <el-tag v-if="!isConnected && !isSideBarCollapsed" effect="light" size="small" type="danger">Offline</el-tag>
                    </div>
                </el-header>
                <el-divider style="margin: 0"/>

                <el-menu :style="{height: `${mainMenuHeight}px`, overflow: 'auto'}"
                         :collapse="isSideBarCollapsed"
                         :collapse-transition="false"
                         :default-active="$route.fullPath"
                         :router="true"
                >
                    <div v-for="menu in sidebarMenu" :key="menu.id">
                        <el-sub-menu v-if="menu.items && menu.items.length && isMenuVisible(menu)"
                                     :index="menu.id"
                        >
                            <template #title>
                                <el-icon>
                                    <Icon :icon=menu.icon width="24" color="gray"/>
                                </el-icon>

                                <span v-if="!isSideBarCollapsed"  style="width: 100%; text-align: left;">{{menu.title}}</span>

                            </template>

                            <el-menu-item v-for="item in menu.items.filter(m => isMenuVisible(m))"
                                          :key="item.id"
                                          :index="item.path">
                                <template #title>
                                    <el-icon v-if="item.icon">
                                        <Icon width="24" :icon=item.icon color="gray" style="min-width: 24px"/>
                                    </el-icon>
                                    <span  style="width: 100%; text-align: left; padding-left: 10px">{{ item.title }}</span>
                                    <div @click="$event.stopPropagation(); openInNewWindow(item.path);" class="open_new" style="width: 16px; height: 100%; display: flex">
                                        <Icon icon="mdi:open-in-new" width="16"/>
                                    </div>
                                </template>

                            </el-menu-item>
                        </el-sub-menu>
                        <el-menu-item v-else-if="isMenuVisible(menu)" :index="menu.path" >
                            <el-icon>
                                <Icon width="24" :icon=menu.icon color="gray" style="min-width: 24px;"/>
                            </el-icon>
                            <template #title>
                                <span style="width: 100%; text-align: left;">{{menu.title}}</span>
                                <div @click="$event.stopPropagation(); openInNewWindow(menu.path);" class="open_new" style="width: 16px; height: 100%; display: flex">
                                    <Icon icon="mdi:open-in-new" width="16"/>
                                </div>
                            </template>
                        </el-menu-item>
                    </div>
                </el-menu>

                <div class="footer " ref="footer">

                    <div v-if="isAdmin" style="width: 100%;">
                        <el-button text @click="router.push('/configuration')" :style="{width: isSideBarCollapsed ? '64px' : '100%', 'justify-content': 'left'}" size="large">
                            <Icon style="padding: 4px" icon="ic:outline-display-settings" width="20"/>
                            <div v-if="!isSideBarCollapsed" style="text-align: start;">{{$t('configuration')}}</div>
                        </el-button>
                    </div>

                    <el-popover
                        placement="right"
                        :width="200"
                        trigger="click"
                    >
                        <template #reference>
                            <div style="width: 100%;">
                                <el-button text :style="{width: isSideBarCollapsed ? '64px' : '100%', 'justify-content': 'left'}" size="large">
                                    <Icon style="padding: 4px" icon="ic:baseline-account-circle" width="20"/>
                                    <div v-if="!isSideBarCollapsed" style="text-align: start;">{{username}}</div>
                                    <Icon v-if="!isSideBarCollapsed" style="position: absolute; right: 8px; opacity:0.2" icon="mdi:chevron-right" width="24"/>
                                </el-button>
                            </div>
                        </template>
                        <template #default>
                            <div>
                                <el-button @click="router.push('/settings')" text style="width: 100%; justify-content: left">
                                    <template #icon>
                                        <Icon icon="ic:outline-settings" width="24"/>
                                    </template>
                                    {{$t('settings')}}
                                </el-button>
                                <el-button @click="logout" text style="width: 100%; justify-content: left; margin-left: 0">
                                    <template #icon>
                                        <Icon icon="ic:baseline-logout" width="24"/>
                                    </template>
                                    {{$t('logout')}}
                                </el-button>
                            </div>

                        </template>
                    </el-popover>

                    <div style="width: 100%; display: flex; justify-content: space-between;">
                        <el-button @click="setCollapsed" text style="width: 32px; opacity:0.2" size="small">
                            <Icon :icon="isSideBarCollapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'" width="24"/>
                        </el-button>
                        <div v-if="!isSideBarCollapsed" style="padding-right: 16px; font-size: 12px; opacity: 0.4">
                            v{{settings.version}}
                        </div>
                    </div>
                </div>
            </el-aside>
            <el-container :style="{width: mainViewWidth + 'px', padding: 0}">
                <el-col class="main-router-view" ref="mainContainer" >
                    <el-main :style="{height: mainViewHeight + 'px', padding: 0}">
                        <router-view :screenSize="screenSize" v-slot="{Component}">
                            <component ref="rView" :is="Component" />
                        </router-view>
                    </el-main>
                </el-col>
            </el-container>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import {computed, ComputedRef, onMounted, onUnmounted, ref} from "vue";
import {MenuConfigInterface} from "../model/menu";
import {useStore} from "vuex";
import {useRoute, useRouter} from 'vue-router'
import {useSocketClient} from '../services/socketio.service'
import {ScreenSize} from "../model/page";
import {useDataSourceService} from "../services/datasource.service";
import {usePageHeader} from "../services/page.service";
import {useSettings} from "../services/settings.service";

import {useI18n} from 'vue-i18n'
const { t } = useI18n();

const props = defineProps<{
    screenSize: ScreenSize
}>()

const mainContainer = ref(null);
const footer = ref(null)
const mainHeader = ref(null);
const rView = ref(null)
let favicon = ref('/favicon.png')
let title = ref('Tabbled')
let permissions = {
    admin: false,
    roles: []
}


let mainViewHeight = ref(0)
let mainMenuHeight = ref(0)
let mainViewWidth = ref(0)
let mainSideBarWidth = ref(250)
let settings = useSettings()
let isAdmin = ref(false)

let isSideBarCollapsed = ref(localStorage.getItem('is_menu_collapsed') === 'true')

const store = useStore();
const router = useRouter();
const route = useRoute()
const dsService = useDataSourceService();


const pageHeader = usePageHeader()

let socketClient = useSocketClient()
let isConnected = ref(socketClient.socket.connected)

socketClient.socket.on("connect", () => {
    isConnected.value = true;
})

socketClient.socket.on("disconnect", () => {
    isConnected.value = false;
})

let sidebarMenu = ref<Array<MenuConfigInterface>>(null)

function getMainViewWidth(): number {
    let width = window.innerWidth;
    width = isSideBarCollapsed.value ? width - 64 : width - mainSideBarWidth.value
    //width = advancedPanel.value.visible ? width - settingPanelWidth.value : width
    return width
}

function setCollapsed() {
    isSideBarCollapsed.value = !isSideBarCollapsed.value;
    handleResize()
    localStorage.setItem('is_menu_collapsed', isSideBarCollapsed.value ? 'true' : 'false')
}

const currentPageTitle: ComputedRef<string> = computed((): string =>  {
    return !pageHeader.title || pageHeader.title === '' ? route.meta.title.toString() : pageHeader.title
})

onMounted(() => {
    console.log('Main mounted')
    favicon.value = window['env']['appFavicon']
    title.value = window['env']['appTitle']
    mainViewHeight.value = mainContainer.value.$el.clientHeight
    mainMenuHeight.value = mainContainer.value.$el.clientHeight - 170
    handleResize();
    window.addEventListener('resize', handleResize);
    loadMenu();

    isAdmin.value = store.getters['auth/account'] && store.getters['auth/account'].permissions.admin

    permissions = store.getters['auth/account'].permissions
    if (!permissions.roles)
        permissions.roles = []
})

onUnmounted(() => {
    console.log('Main unmounted')
    window.removeEventListener('resize', handleResize);
})

function handleResize() {
    mainViewWidth.value = getMainViewWidth();
}

const username: ComputedRef<string> = computed((): string =>  {
    return store.getters['auth/user'] ? store.getters['auth/user'].username : ""
})

function openInNewWindow(to: string) {
    let route = router.resolve({path: to});
    window.open(route.href);
}

function isMenuVisible(menu) {
    switch (menu.visibility) {
        case 'all': return true;
        case 'nobody': return false;
        case 'roles':
            return menu.visibilityRoles.some(r=> permissions.roles.includes(r))
        default: return false
    }
}

async function loadMenu() {
    try {
        let menu = await socketClient.emit('config/params/get', {
            id: 'menu'
        })
        sidebarMenu.value = (menu as MenuConfigInterface[])

        console.log(sidebarMenu.value)
    } catch (e) {
        console.error(e)
        return;
    }
}

function logout() {
    store.dispatch('auth/logout')
        .then(() => {
            router.push('/login')
        })
}

</script>

<style lang="scss">

.page-header-action-panel {
    display: flex;
    flex-flow: row;
}

.open_new {
    color: var(--el-border-color);
    border-radius: unset;
    align-content: center;
    align-items: center;
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
    width: inherit;
    position: absolute;
    overflow: hidden;
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