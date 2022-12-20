<template>
    <div v-if="$route.meta.isSingle" class="single-page" >
        <router-view />
    </div>


    <el-container v-else class="main">
        <el-container>
            <el-aside width="250px" ref="aside">
                <el-header height="auto" style="margin: 16px; --el-header-padding: 0">
                    <el-col >
                        <el-row align="middle">
                            <img height="30" src="./assets/tabbled_icon.svg" alt=""/>
                            <div style="margin-left: 8px">Tabbled</div>
                        </el-row>
                    </el-col>

                </el-header>
                <el-divider style="margin: 0"/>

                    <el-menu
                        :collapse="isCollapsed"
                        :default-active="$route.fullPath"
                        :router="true"
                    >
                        <div v-for="menu in sidebarMenu" :key="menu.id">
                            <el-sub-menu v-if="menu.items"
                                         :index="menu.id">
                                <template #title>
                                    <span class="iconify" :data-icon="'mdi:'+menu.icon" style="width: 18px; height: 18px; margin-right: 8px"></span>
                                    <span>{{menu.title}}</span>
                                </template>

                                <el-menu-item v-for="item in menu.items"
                                              :key="item.id"
                                              :index="item.path">
                                    <template #title>
                                        <span  style="width: 100%; text-align: left;">{{item.title }}</span>
                                        <div @click="$event.stopPropagation(); openInNewWindow(item.path);" class="open_new" style="width: 16px; height: 100%;">
                                            <span class="iconify " data-icon="mdi:open-in-new" style="width: 16px; height: 100%;"/>
                                        </div>
                                    </template>

                                </el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else :index="menu.path" >
                                <template #title>
                                    <span class="iconify" :data-icon="'mdi:'+menu.icon" style="width: 18px; height: 18px; margin-right: 8px"/>
                                    <span>{{menu.title}}</span>
                                </template>
                            </el-menu-item>
                        </div>
                    </el-menu>

                <div class="footer ">
                    <el-menu @select="showUserMenu" :collapse="isCollapsed">

                        <el-menu-item index="1">
                            <span class="iconify" data-icon="mdi:user" style="width: 24px; height: 24px; margin-right: 8px"/>

                            <span style="width: 100%; text-align: start;">{{username()}}</span>
                            <div @click="logout()" class="open_new" style="width: 16px; height: 100%;">
                                <span class="iconify " data-icon="mdi:exit-to-app" style="width: 24px; height: 100%;"/>
                            </div>
                        </el-menu-item>

<!--                        <el-menu-item index="1" @click="isMenuCollapse = !isMenuCollapse">-->
<!--                            <span style="width: 100%; text-align: start;">{{username()}}</span>-->
<!--                        </el-menu-item>-->

                    </el-menu>
                </div>
            </el-aside>
            <el-container>
                <el-col class="main-router-view" ref="mainContainer">

                    <el-page-header ref="mainHeader" style="margin: 16px" @back="$router.back()">
                        <template #content>
                            <span class="text-large font-600 mr-3"> Customers </span>
                        </template>

                        <template #extra>
                            <div class="flex items-center">
                                <el-button>Print</el-button>
                                <el-button type="primary" class="ml-2">Edit</el-button>
                            </div>
                        </template>
                    </el-page-header>
                    <el-main>
                        <el-scrollbar :height="mainViewHeight">
                            <router-view/>

                        </el-scrollbar>


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
import { onMounted, ref } from "vue";
import { MenuConfigInterface } from "./model/menu";
import { useStore } from "vuex";
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSocket } from './services/socketio.service'
import { ElNotification } from 'element-plus'

const props = defineProps<{

}>()

const mainContainer = ref(null);
const mainHeader = ref(null);

let mainViewHeight = ref(0)
let isCollapsed = ref(false)

onMounted(() => {
    mainViewHeight.value = mainContainer.value.$el.clientHeight - mainHeader.value.$el.clientHeight;

    if (store.getters['config/isLoaded']) {
        loadMenu()
    }
})


const store = useStore();
const router = useRouter();
const { t } = useI18n();

let socketio = ref({
    initiated: false,
    error_message: "",
    isConnected: false
})
let socket  = useSocket()
initSocketIO()

let sidebarMenu = ref<Array<MenuConfigInterface>>([])

store.subscribe((mutation: any) => {
    if (mutation.type === 'config/loaded') {
        loadMenu()
    }
});


function username(): string {
    return store.getters['auth/user'] ? store.getters['auth/user'].username : ""
}

function openInNewWindow(to: string) {
    let route = router.resolve({path: to});
    window.open(route.href);
}


function loadMenu() {

    console.log(t('configuration'))

    sidebarMenu.value = Object.assign([], store.getters['config/sidebarMenu'])

    if (store.getters['auth/account'].permissions.admin) {
        sidebarMenu.value.push(
            {
                id: "config",
                title: t('configuration'),
                icon: 'application-brackets-outline',
                items: [
                    {
                        id: "models",
                        title: t('tableModels'),
                        path: `/configuration/models`,
                    },
                    {
                        id: "templates",
                        title: t('reportTemplates'),
                        path: `/configuration/report-templates`,
                    },
                ]
            })
    }
}

function logout() {
    store.dispatch('auth/logout')
        .then(() => {
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
        socket.connected = true;
        ElNotification.warning({
            title: 'Disconnected',
            message: "Lost connection to the server",
            showClose: true,
        })
    });

    //When the server decided that token is not valid or expired
    socket.on("login_needed", () => {
        router.push('/login');
    })

    socket.on("connect", async () => {
        console.log("Connected to the socket server");

        if (!socketio.value.isConnected)
            ElNotification.success({
                title: 'Connected',
                message: "Connected to the server",
                showClose: true,
                type: 'success',
            })

        await store.dispatch('auth/loadUserSettings');
        await store.dispatch('config/load');

        socketio.value.isConnected = true;
    });
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
    width: calc(100% - 250px);
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
