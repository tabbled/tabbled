import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";

import Dashboard from "./pages/Dashboard.vue"
import NotFound from "./pages/NotFound.vue";

const Login = () => import("./pages/Login.vue")
const UserEdit = () => import("./pages/configuration/UserEdit.vue")
const PageDesigner = () => import("./pages/configuration/PageDesigner.vue")
const Configuration = () => import("./pages/configuration/Configuration.vue")
const FunctionEdit = () => import("./pages/configuration/FunctionEdit.vue")
const DataSourceEdit = () => import("./pages/configuration/DataSourceEdit.vue")
const MenuEdit = () => import("./pages/configuration/MenuEdit.vue")
const ReportEdit = () => import("./pages/configuration/ReportEdit.vue")
const UserSettings = () => import("./pages/UserSettings.vue")


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
    },{
        name: 'userEdit',
        path: "/configuration/users/:id",
        component: UserEdit,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "User"
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



export default function (store: any) {
    const router = createRouter({
        history: createWebHistory(),
        routes,
    });



    router.beforeEach(async (to, from, next) => {
        // @ts-ignore
        window.document.title = `${to.meta && to.meta.title ? to.meta.title + ' |' : ''} ${window['env']['appTitle'] ? window['env']['appTitle'] : 'Tabbled'}`;
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