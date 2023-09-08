import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import Login from "./pages/Login.vue";
import Dashboard from "./pages/Dashboard.vue"
import NotFound from "./pages/NotFound.vue";
import PageDesigner from "./pages/PageDesigner.vue";
import Configuration from "./pages/Configuration.vue";
import FunctionEdit from "./pages/FunctionEdit.vue";
import DataSourceEdit from "./pages/DataSourceEdit.vue";
import MenuEdit from "./pages/MenuEdit.vue";
import {Settings} from "./services/settings.service";
import ReportEdit from "./pages/ReportEdit.vue";
import UserSettings from "./pages/UserSettings.vue";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: Dashboard,
        meta: {
            authRequired: true,
            title: ""
        },
    },
    {
        path: "/login",
        component: Login,
        meta: {
            isSingle: true,
            authRequired: false,
            title: "Login"
        },
    },
    {
        path: "/configuration/pages/:id",
        component: PageDesigner,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "Designer"
        },
    },
    {
        name: 'functionEdit',
        path: "/configuration/functions/:id",
        component: FunctionEdit,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "Function"
        },
    },
    {
        name: 'reportEdit',
        path: "/configuration/reports/:id",
        component: ReportEdit,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "Report"
        },
    },
    {
        name: 'dataSoruceEdit',
        path: "/configuration/datasources/:id",
        component: DataSourceEdit,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "DataSource"
        },
    },
    {
        name: 'menuEdit',
        path: "/configuration/menu/:id",
        component: MenuEdit,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "Menu"
        },
    },
    {
        path: "/configuration",
        component: Configuration,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "Configuration"
        },
    },
    {
        path: "/settings",
        component: UserSettings,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "User settings"
        },
    },
    {
        path: "/:pathMatch(.*)*",
        component: NotFound,
        meta: {
            isSingle: true,
            authRequired: true,
        }
    }
]



export default function (store: any, settings:Settings) {
    const router = createRouter({
        history: createWebHistory(),
        routes,
    });


    router.beforeEach(async (to, from, next) => {
        // @ts-ignore
        window.document.title = `${to.meta && to.meta.title ? to.meta.title : ''}${ settings.title ? ' | ' + settings.title : '' }`;
        if(to.matched.some(record => record.meta.authRequired)) {
            if (store.getters['auth/isAuthenticated']) {

                if (!canActivate(to))
                    next('/404')
                else next();
            } else
                next('/login')
        } else
            next()
    });

    function canActivate(to) {
        return !(to.path === '/configuration' && !store.getters['auth/account'].permissions.admin);
    }

    return router
}