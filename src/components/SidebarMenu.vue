<template>
    <div ref="sidebarMenuContainer" class="sidebar-menu-container">
        <div class="menu-header" @click="router.push('/')">

                <div>
                    <el-row align="middle">
                        <img height="30" :src="favicon" alt=""/>
                        <div v-if="!isSideBarCollapsed" style="margin-left: 8px">{{title}}</div>
                    </el-row>
                </div>
                <el-tag v-if="!isConnected && !isSideBarCollapsed" effect="light" size="small" type="danger">Offline</el-tag>

        </div>

            <el-menu class="sidebar-menu"
                     :collapse="isSideBarCollapsed"
                     :collapse-transition="false"
                     :default-active="$route.fullPath"
                     :router="true"
                     style="width: 100%"
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
                                <div @click="$event.stopPropagation(); openInNewWindow(item.path);" class="open-new">
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
                            <div @click="$event.stopPropagation(); openInNewWindow(menu.path);" class="open-new">
                                <Icon icon="mdi:open-in-new" width="16"/>
                            </div>
                        </template>
                    </el-menu-item>
                </div>
            </el-menu>

        <div class="sidebar-menu-footer">


                <el-menu :default-active="$route.fullPath" >
                    <el-menu-item v-if="isAdmin" @click="router.push('/configuration')">
                        <Icon icon="ic:outline-display-settings" width="24" color="gray" style="min-width: 24px;" />
                        <template #title>
                            <span v-if="!isSideBarCollapsed" style="width: 100%; padding-left: 8px; text-align: left;">{{$t('configuration')}}</span>

                            <div v-if="!isSideBarCollapsed" @click="$event.stopPropagation(); openInNewWindow('/configuration');" class="open-new">
                                <Icon icon="mdi:open-in-new" width="16"/>
                            </div>
                        </template>
                    </el-menu-item>

                    <el-menu-item ref="userMenuItem">
                        <Icon style=" min-width: 24px;" color="gray" icon="ic:baseline-account-circle" width="20" />
                        <template #title>
                            <span v-if="!isSideBarCollapsed" style="width: 100%; padding-left: 8px; text-align: left;">{{username}}</span>

                            <div v-if="!isSideBarCollapsed" @click="$event.stopPropagation(); openInNewWindow('/configuration');" class="open-new">
                                <Icon icon="mdi:chevron-right" width="16"/>
                            </div>
                        </template>
                    </el-menu-item>
                </el-menu>

            <el-popover
                placement="right"
                :width="200"
                trigger="hover"
                :virtual-ref="userMenuItem"
            >
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
    </div>


</template>

<script setup lang="ts">

import {computed, ComputedRef, onMounted, ref} from "vue";
import {MenuConfigInterface} from "../model/menu";
import {useStore} from "vuex";
import {useSocketClient} from "../services/socketio.service";
import {useSettings} from "../services/settings.service";
import {useRouter} from "vue-router";
import {ScreenSize} from "../model/page";

let isSideBarCollapsed = ref(localStorage.getItem('is_menu_collapsed') === 'true')
let isAdmin = ref(false)
let mainSideBarWidth = ref('250px')
let sidebarMenu = ref<Array<MenuConfigInterface>>(null)
const store = useStore();
let socketClient = useSocketClient()
let settings = useSettings()
const router = useRouter();
let favicon = ref('/favicon.png')
let title = ref('Tabbled')
let userMenuItem = ref(null)

let permissions = {
    admin: false,
    roles: []
}

const props = defineProps<{
    screenSize: ScreenSize
}>()

const username: ComputedRef<string> = computed((): string =>  {
    return store.getters['auth/user'] ? store.getters['auth/user'].username : ""
})

onMounted(() => {
    console.log('Sidebar mounted')

    loadMenu();

    mainSideBarWidth.value = `${!isSideBarCollapsed.value ? 250 : 60}px`
    isAdmin.value = store.getters['auth/account'] && store.getters['auth/account'].permissions.admin

    permissions = store.getters['auth/account'].permissions
    if (!permissions.roles)
        permissions.roles = []
})

let isConnected = ref(socketClient.socket.connected)

socketClient.socket.on("connect", () => {
    isConnected.value = true;
})

socketClient.socket.on("disconnect", () => {
    isConnected.value = false;
})

function setCollapsed() {
    isSideBarCollapsed.value = !isSideBarCollapsed.value;
    mainSideBarWidth.value = `${!isSideBarCollapsed.value ? 300 : 60}px`

    localStorage.setItem('is_menu_collapsed', isSideBarCollapsed.value ? 'true' : 'false')
}

function isMenuVisible(menu) {
    switch (menu.visibility) {
        case 'all': return true;
        case 'nobody': return false;
        case 'roles':
            return menu.visibilityRoles ? menu.visibilityRoles.some(r=> permissions.roles.includes(r)) : false
        default: return false
    }
}

async function loadMenu() {
    try {
        let menu = await socketClient.emit('config/params/get', {
            id: 'menu'
        })
        sidebarMenu.value = (menu as MenuConfigInterface[])
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

function openInNewWindow(to: string) {
    let route = router.resolve({path: to});
    window.open(route.href);
}

</script>

<style lang="scss">
.sidebar-menu-container {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--el-border-color);
    width: v-bind(mainSideBarWidth);
    min-width: v-bind(mainSideBarWidth);
    height: 100%;


    .el-menu {
        border-right: none;
    }
}

.sidebar-menu {
    height: 100%;
    overflow: auto;
}

.sidebar-menu-footer {
    flex-shrink: 0;
}

.menu-header {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color);
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
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

.open-new {
    display: flex;
    align-items: center;
    opacity: 0.2;
}
</style>