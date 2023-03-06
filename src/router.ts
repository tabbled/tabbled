import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import Login from "./pages/Login.vue";
import Dashboard from "./pages/Dashboard.vue"
import NotFound from "./pages/NotFound.vue";
import PageDesigner from "./pages/PageDesigner.vue";
import Configuration from "./pages/Configuration.vue";
import FunctionEdit from "./pages/FunctionEdit.vue";

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
        path: "/designer/:id",
        component: PageDesigner,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "Designer"
        },
    },
    {
        name: 'functionEdit',
        path: "/functions/:id",
        component: FunctionEdit,
        meta: {
            isSingle: false,
            authRequired: true,
            title: "Function"
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
        window.document.title = `${to.meta && to.meta.title ? to.meta.title + ' | ' : ''}Tabbled`;
        if(to.matched.some(record => record.meta.authRequired)) {
            if (store.getters['auth/isAuthenticated']) {
                next();
                return
            }
            next('/login')
        } else
            next()
    });

    return router
}