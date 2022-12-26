import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";
import Login from "./pages/Login.vue";
import Main from "./pages/Main.vue"
import NotFound from "./pages/NotFound.vue";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: Main,
        meta: {
            authRequired: true,
            title: "Tabbled"
        },
    },
    {
        path: "/login",
        component: Login,
        meta: {
            isSingle: true,
            authRequired: false,
            title: "Tabbled | Login"
        },
    },
    {
        path: "/:pathMatch(.*)*",
        component: NotFound,
        meta: {
            isSingle: true,
        }
    }
]



export default function (store: any) {
    const router = createRouter({
        history: createWebHistory(),
        routes,
    });

    router.beforeEach(async (to, from, next) => {
        window.document.title = to.meta && to.meta.title ? to.meta.title.toString() : 'Tabbled';
        console.log(to.matched)
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