<template>
    <div ref="sidebarMenuContainer" class="sidebar-menu-container divide-y">
        <div class="p-4 flex flex-row items-center justify-around cursor-pointer" @click="router.push('/')">

                <div class="flex flex-row items-center cursor-pointer w-full">

                        <img height="32" width="32" :src="favicon" alt=""/>
                        <div v-if="!collapsed" class="text-xl ml-4 text-slate-600">{{title}}</div>

                </div>
                <el-tag v-if="!isConnected && !collapsed" effect="light" size="small" type="danger">Offline</el-tag>

        </div>

            <el-menu class="sidebar-menu group"
                     :collapse="collapsed"
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

                            <span v-if="!collapsed"  style="width: 100%; text-align: left;">{{menu.title}}</span>

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

                <div ref="addItemButton" v-if="permissions && permissions.admin" class="w-full relative p-2 invisible group-hover:visible">
                    <div class="text-center m-2 opacity-60 hover:opacity-100 rounded hover:border-blue-300 border border-dashed cursor-pointer hover:bg-blue-50 hover:text-blue-400"
                    @click="e => openAddItemDialog(e)">
                        {{$t('add')}}
                    </div>
                </div>
            </el-menu>


        <div class="sidebar-menu-footer">


                <el-menu :default-active="$route.fullPath" disabled>
<!--                    <el-menu-item v-if="isAdmin" @click="">-->
<!--                        <MarketplaceIcon style="min-width: 24px; height: 24px" color="gray"/>-->
<!--                        <template #title>-->
<!--                            <span v-if="!collapsed" style="width: 100%; padding-left: 8px; text-align: left;">{{$t('marketplace')}}</span>-->

<!--                            <el-tag type="info" size="small" style="margin-right: 8px">{{$t('soon')}}</el-tag>-->
<!--&lt;!&ndash;                            <div v-if="!collapsed" @click="$event.stopPropagation(); " class="open-new">&ndash;&gt;-->
<!--&lt;!&ndash;                                <Icon icon="mdi:open-in-new" width="16"/>&ndash;&gt;-->
<!--&lt;!&ndash;                            </div>&ndash;&gt;-->
<!--                        </template>-->
<!--                    </el-menu-item>-->

                    <el-menu-item v-if="isAdmin" @click="router.push('/configuration')">
                        <Icon icon="ic:outline-display-settings" width="24" color="gray" style="min-width: 24px;" />
                        <template #title>
                            <span v-if="!collapsed" style="width: 100%; padding-left: 8px; text-align: left;">{{$t('configuration')}}</span>

                            <div v-if="!collapsed" @click="$event.stopPropagation(); openInNewWindow('/configuration');" class="open-new">
                                <Icon icon="mdi:open-in-new" width="16"/>
                            </div>
                        </template>
                    </el-menu-item>

                    <el-menu-item ref="userMenuItem">
                        <Icon style=" min-width: 24px;" color="gray" icon="ic:baseline-account-circle" width="20" />
                        <template #title>
                            <span v-if="!collapsed" style="width: 100%; padding-left: 8px; text-align: left;">{{username}}</span>

                            <div v-if="!collapsed" @click="$event.stopPropagation(); openInNewWindow('/configuration');" class="open-new">
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
                    <Icon :icon="collapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'" width="24"/>
                </el-button>
                <div v-if="!collapsed" style="padding-right: 16px; font-size: 12px; opacity: 0.4">
                    v{{settings.version}}
                </div>
            </div>
        </div>

        <ContextMenu v-model:visible="addItemDialogVisible" :x="addItemX" :y="addItemY" width="400px">
            <div class="flex flex-col divide-y p-4">
                <AddMenuItem class="pb-4" size="small" v-model="addMenuItem"/>
                <div class="flex flex-row justify-end pt-4">
                    <el-button type="primary" size="small" @click="onAddItem">{{$t('add')}}</el-button>
                </div>
            </div>
        </ContextMenu>
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
import AddMenuItem from "../pages/configurationV2/menu/AddMenuItem.vue";
import ContextMenu from "./ContextMenu.vue";
//import MarketplaceIcon from "./icons/marketplace-icon.vue";


let isAdmin = ref(false)
let sidebarMenu = ref<Array<MenuConfigInterface>>(null)
const store = useStore();
let socketClient = useSocketClient()
let settings = useSettings()
const router = useRouter();
let favicon = ref('/favicon.png')
let title = ref('Tabbled')
let userMenuItem = ref(null)
const addItemDialogVisible = ref(false)
const addItemX = ref(100)
const addItemY = ref(100)
const addItemButton = ref(null)

let permissions = {
    admin: false,
    roles: []
}
interface AddMenuDto extends MenuConfigInterface {
    template: string
}
const addMenuItem = ref<AddMenuDto>({
    id: '',
    title: "",
    icon: "",
    path: "",
    template: "",
    visibility: 'all',
    visibilityRoles: []
})

const props = defineProps<{
    screenSize: ScreenSize
    collapsed: boolean
}>()

const emit = defineEmits<{
    (e: 'update:collapsed', val): string
}>()

const username: ComputedRef<string> = computed((): string =>  {
    return store.getters['auth/user'] ? store.getters['auth/user'].username : ""
})


const width: ComputedRef<string> = computed((): string =>  {
    return `${!props.collapsed ? 250 : 60}px`
})

onMounted(() => {

    loadMenu();
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

const setCollapsed = () => {
    emit('update:collapsed', !props.collapsed)
}

const isMenuVisible = (menu) => {
    switch (menu.visibility) {
        case 'all': return true;
        case 'nobody': return false;
        case 'roles':
            return menu.visibilityRoles ? menu.visibilityRoles.some(r=> permissions.roles.includes(r)) : false
        default: return false
    }
}

const loadMenu = async () => {
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

const logout = () => {
    store.dispatch('auth/logout')
        .then(() => {
            router.push('/login')
        })
}

const openAddItemDialog = (e) => {
    console.log('ss', e)
    let pos = addItemButton.value.getBoundingClientRect()
    addItemX.value = pos.width;
    addItemY.value = pos.y;
    //addItemX.value = e.clientX;
    //addItemY.value = e.clientY;
    addItemDialogVisible.value = true
}

const onAddItem = async () => {
    console.log('onAddItem')
    addMenuItem.value.id = String(sidebarMenu.value.length + 1)
    sidebarMenu.value.push(addMenuItem.value)
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
    width: v-bind(width);
    height: 100%;


    .el-menu {
        border-right: none;
    }
}

.sidebar-menu {
    height: 100%;
    overflow: auto;
    padding-top: 8px;
}

.sidebar-menu-footer {
    flex-shrink: 0;
    border-top: 1px solid var(--el-border-color);
    padding-top: 10px;
}

//.menu-header {
//    display: flex;
//    flex-direction: row;
//    margin: 0;
//    padding: 16px;
//    border-bottom: 1px solid var(--el-border-color);
//    justify-content: space-between;
//    align-items: center;
//    cursor: pointer;
//}

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