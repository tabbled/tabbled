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
    <Main v-else :screen-size="screenSize" />
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Main from "./pages/Main.vue"
import {onMounted, onUnmounted, ref} from "vue";
import {useStore} from "vuex";
import {DataSourceType} from "./model/datasource";
import {PageConfigInterface, ScreenSize} from "./model/page";
import {useDataSourceService} from "./services/datasource.service";
import {useDatabase} from "./services/database.service";
import {useSyncService} from "./services/sync.service";
import PageView from "./pages/PageView.vue";


const store = useStore();
const route = useRoute();
const router = useRouter();

let isConfigLoaded = ref(false)
let screenSize = ref(ScreenSize.desktop)

const dsService = useDataSourceService();
const db = useDatabase();
const syncService = useSyncService()

let pagesByAlias = ref<Map<string, PageConfigInterface>>(new Map())

store.subscribe(async (payload) => {
    if (payload.type === 'auth/userLoaded' && !isConfigLoaded.value) {
        await loadConfig()
        await loadData()
    }

    if (payload.type === 'auth/loggedOut') {
        isConfigLoaded.value = false;
        await db.close()
        await dsService.clear(DataSourceType.config)
        await dsService.clear(DataSourceType.data)
    }
})

onMounted(async () => {
    window.addEventListener('resize', handleResize);
    handleResize();
    isConfigLoaded.value = false;

    if (store.getters["auth/isAuthenticated"]) {
        await store.dispatch('auth/loadUserSettings')
        await loadConfig()
        await loadData()
    }
})

onUnmounted(() => {
    console.log('App unmounted')
    window.removeEventListener('resize', handleResize);
    isConfigLoaded.value = false;
})



function handleResize() {
    screenSize.value = window.innerWidth > 800 ? ScreenSize.desktop : ScreenSize.mobile
}

async function loadData() {
    await syncService.sync(DataSourceType.data)
}

async function loadConfig() {

    try {
        await db.open(store.getters["auth/account"], store.getters["auth/user"]);
        await dsService.registerConfig();
        await syncService.sync(DataSourceType.config)
    } catch (e) {
        console.error(e)
    }

    await Promise.all([
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
        component: PageView,
        props: {
            pageConfig: page,
            screenSize: screenSize.value
        },
        meta: {
            isSingle: false,
            authRequired: true,
            title: page.title
        }
    })
    pagesByAlias.value.set(path, page);
    console.info('Route ' + path + ' added')

    if (path === router.currentRoute.value.path) {
        router.replace(path)
    }
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
