<template>
    <div v-if="route.meta.isSingle" style="width: 100vw" >
        <router-view />
    </div>
    <div v-else-if="!isConfigLoaded" style="width: 30vw; margin: auto">
        <el-progress
            status="success"
            :indeterminate="true"
            :duration="1"
            :percentage="100"
        />
        <div>Loading...</div>
    </div>
    <Main v-else :layout-size="layoutSize" />
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Main from "./pages/Main.vue"
import {onMounted, onUnmounted, ref} from "vue";
import {useStore} from "vuex";
import {DataSourceType} from "./model/datasource";
import {PageConfigInterface, LayoutSize} from "./model/page";
import {usePagesActions} from "./services/page.service";
import {useDataSourceService} from "./services/datasource.service";
import {useDatabase} from "./services/database.service";
import {useSyncService} from "./services/sync.service";
import {useSocketClient} from './services/socketio.service'
import ListPage from "./pages/ListPage.vue";
import NotFound from "./pages/NotFound.vue";


const store = useStore();
const route = useRoute();
const router = useRouter();

let isConfigLoaded = ref(false)
let layoutSize = ref(LayoutSize.large)

const pagesActions = usePagesActions();
const dsService = useDataSourceService();
const db = useDatabase();
const syncService = useSyncService()
let socketClient = useSocketClient()

let pagesByAlias = ref<Map<string, PageConfigInterface>>(new Map())

onMounted(() => {
    window.addEventListener('resize', handleResize);
    handleResize();

    if (store.getters["auth/isAuthenticated"]) {
        isConfigLoaded.value = false;
        store.dispatch('auth/loadUserSettings')
        loadConfig();
    }


})

onUnmounted(() => {
    console.log('App unmounted')
    window.removeEventListener('resize', handleResize);
    isConfigLoaded.value = false;
})

function handleResize() {
    layoutSize.value = window.innerWidth > 800 ? LayoutSize.large : LayoutSize.small
}

async function loadConfig() {
    try {
        await db.open(store.getters["auth/account"], store.getters["auth/user"]);
        await dsService.registerConfig();
        await syncService.sync(DataSourceType.config)
    } catch (e) {
        console.error(e)
    }

    Promise.all([
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

    let pages = await dsService.getDataSourceByAlias('page').getAll()

    pages.forEach((item: PageConfigInterface) => {
        addRoute(item.path, item);
    })
}

function addRoute(path: string, page: PageConfigInterface) {
    if (!path || !page)
        return;

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

function getComponentByName(name: string) {
    switch (name) {
        //case 'EditPage': return EditPage
        case 'ListPage': return ListPage
    }
    return NotFound
}

</script>


<style lang="scss">
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
    width: 100vw;
}

</style>
