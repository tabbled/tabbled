<template>
    <el-container class="main"
                  @mouseup="endResizeSettingPanel"
                  @mousemove="onResizeSettingPanel">
        <el-container>
            <el-aside :width="isSideBarCollapsed ? '64px' : mainSideBarWidth + 'px'" ref="aside">
                <el-header height="auto" style="margin: 16px; --el-header-padding: 0">
                    <div class="menu-header">
                        <div>
                            <el-row align="middle">
                                <img height="30" src="./../assets/tabbled_icon.svg" alt=""/>
                                <div v-if="!isSideBarCollapsed" style="margin-left: 8px">Tabbled</div>
                            </el-row>
                        </div>
                        <el-tag v-if="!isConnected" effect="light" size="small" type="danger">Offline</el-tag>
                    </div>
                </el-header>
                <el-divider style="margin: 0"/>

                <el-menu style="height: 400px"
                         :collapse="isSideBarCollapsed"
                         :collapse-transition="false"
                         :default-active="$route.fullPath"
                         :router="true"
                >
                    <div v-for="menu in sidebarMenu" :key="menu.id">
                        <el-sub-menu v-if="menu.items"
                                     :index="menu.id"
                        >
                            <template #title>
                                <el-icon>
                                    <Icon :icon=menu.icon width="24" color="gray"/>
                                </el-icon>

                                <span v-if="!isSideBarCollapsed">{{menu.title}}</span>
                            </template>

                            <el-menu-item v-for="item in menu.items"
                                          :key="item.id"
                                          :index="item.path">
                                <template #title>
                                    <el-icon v-if="item.icon">
                                        <Icon width="24" :icon=item.icon color="gray" style="min-width: 24px"/>
                                    </el-icon>
                                    <span  style="width: 100%; text-align: left;">{{ item.title }}</span>
                                    <div @click="$event.stopPropagation(); openInNewWindow(item.path);" class="open_new" style="width: 16px; height: 100%; display: flex">
                                        <Icon icon="mdi:open-in-new" width="16"/>
                                    </div>
                                </template>

                            </el-menu-item>
                        </el-sub-menu>
                        <el-menu-item v-else :index="menu.path" >
                            <el-icon>
                                <Icon width="24" :icon=menu.icon color="gray" style="min-width: 24px;"/>
                            </el-icon>
                            <template #title>
                                <span>{{menu.title}}</span>
                            </template>
                        </el-menu-item>
                    </div>
                </el-menu>

                <div class="footer ">
                    <el-menu
                        :collapse="isSideBarCollapsed"
                        :collapse-transition="false"
                    >

                        <el-menu-item index="1">
                            <Icon width="24" icon="ic:baseline-account-circle" color="gray" style="margin-right: 8px; min-width: 24px;"/>

                            <span style="width: 100%; text-align: start;">{{username}}</span>
                            <div v-if="!isSideBarCollapsed" @click="logout()" class="open_new" style="height: 100%; display: flex">
                                <Icon width="24" icon="ic:baseline-exit-to-app"></Icon>
                            </div>
                        </el-menu-item>


                        <div style="width: 100%;">
                            <el-button @click="setCollapsed" text style="width: 64px; opacity: 40%" size="small">
                                <Icon :icon="isSideBarCollapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'" width="24"/>
                            </el-button>
                        </div>


                    </el-menu>
                </div>
            </el-aside>
            <el-container :style="{width: mainViewWidth + 'px'}">
                <el-col class="main-router-view" ref="mainContainer" >
                    <el-page-header ref="mainHeader" class="page-header" @back="$router.back()">
                        <template #content>
                            <span class="text-large font-600 mr-3"> {{currentPageTitle}} </span>
                        </template>

                        <template #extra>
                            <div class="flex items-center">
                                <el-button v-for="action in pageHeader.actions"
                                           :type="action.type ? action.type : 'default'"
                                           @click="action.func()"
                                >
                                    {{action.title}}
                                </el-button>
                            </div>
                        </template>
                    </el-page-header>
                    <el-main :style="{height: mainViewHeight + 'px'}">
                        <router-view :screenSize="screenSize" v-slot="{Component}">
                            <component ref="rView" :is="Component" />
                        </router-view>


                    </el-main>
                </el-col>
            </el-container>
            <el-aside v-if="advancedPanel.visible"
                      class="advancedPanel"
                      :width="String(settingPanelWidth) + 'px'">

                <div class="resizer"
                     @mousedown="initResizeSettingPanel"/>

                <ElementSettingPanel
                    style="width: 100%"
                    :properties="advancedPanel.parameters"
                    :element="advancedPanel.element"
                    :data-sets="advancedPanel.dataSets"
                    @update="advancedPanel.onUpdate" />

            </el-aside>
        </el-container>
    </el-container>
    <!--    <div class="locale-changer">-->
    <!--        <select v-model="$i18n.locale">-->
    <!--            <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>-->
    <!--        </select>-->
    <!--    </div>-->
</template>

<script setup lang="ts">
import {computed, ComputedRef, onMounted, onUnmounted, ref, watch} from "vue";
import {MenuConfigInterface} from "../model/menu";
import {useStore} from "vuex";
import {useRoute, useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'
import {useSocketClient} from '../services/socketio.service'
import {ScreenSize} from "../model/page";
import {useDataSourceService} from "../services/datasource.service";
import {useAdvancedPanel, usePageHeader} from "../services/page.service";
import ElementSettingPanel from '../components/ElementSettingPanel.vue'


const props = defineProps<{
    screenSize: ScreenSize
}>()

const mainContainer = ref(null);
const mainHeader = ref(null);
const rView = ref(null)
const advancedPanel = useAdvancedPanel()

let mainViewHeight = ref(0)
let mainViewWidth = ref(0)
let mainSideBarWidth = ref(250)
let settingPanelWidth = ref<number>(getSettingsPanelWidth())
let isResizingSettingPanel = false
let startXResizingSettingPanel = 0

let isSideBarCollapsed = ref(localStorage.getItem('is_menu_collapsed') === 'true')

const store = useStore();
const router = useRouter();
const route = useRoute()
const dsService = useDataSourceService();
const { t } = useI18n();
const pageHeader = usePageHeader()

let socketClient = useSocketClient()
let isConnected = ref(socketClient.socket.connected)

function getSettingsPanelWidth():number {
    let w = localStorage.getItem('settings_panel_width')
    return w ? Number(w) : 300
}

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

function getMainViewWidth(): number {
    let width = window.innerWidth;
    width = isSideBarCollapsed.value ? width - 64 : width - mainSideBarWidth.value
    width = advancedPanel.value.visible ? width - settingPanelWidth.value : width
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
    mainViewHeight.value = mainContainer.value.$el.clientHeight - mainHeader.value.$el.clientHeight;
    handleResize();
    window.addEventListener('resize', handleResize);
    loadMenu();
})

onUnmounted(() => {
    console.log('Main unmounted')
    window.removeEventListener('resize', handleResize);
})

watch(() => advancedPanel.value.visible,
    async () => {
        handleResize()
    },
    {
        deep: true
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


async function loadMenu() {
    let menus = await dsService.getDataSourceByAlias('menu').getAll()

    if (!menus.length) {
        console.warn('No menu for sideBar in config')
        return;
    }

    sidebarMenu.value = (menus[0] as MenuConfigInterface[])

    if (menus.length > 1)
        console.warn('Number of menu over the 1, for sideBar menu has taken first item')
}

function logout() {
    store.dispatch('auth/logout')
        .then(() => {
            router.push('/login')
        })
}

function onResizeSettingPanel(e: MouseEvent) {
    if (!isResizingSettingPanel) {
        return;
    }

    settingPanelWidth.value += startXResizingSettingPanel - e.clientX
    startXResizingSettingPanel = e.clientX

    localStorage.setItem('settings_panel_width', String(settingPanelWidth.value))

    handleResize()
}

function initResizeSettingPanel(e:MouseEvent) {
    isResizingSettingPanel = true;

    startXResizingSettingPanel = e.clientX
}

function endResizeSettingPanel() {
    isResizingSettingPanel = false
}

</script>

<style lang="scss">

.resizer {
    position: absolute;
    top:0;
    bottom: 0;
    width: 5px;
    z-index: 11;
    cursor: col-resize;
}

.resizer:hover {
    //background: #c45656;
    border-left-color: var(--el-border-color);
    border-left-width: 2px;
    border-left-style: solid;
}

.advancedPanel {
    display: flex;
    flex-wrap: wrap;
    overflow: hidden;


}

.el-aside .advancedPanel{
    overflow: unset;
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
    width: inherit;
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