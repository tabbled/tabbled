import { createRouter, createWebHistory } from "vue-router";
import Login from "./pages/Login.vue";
import Main from "./pages/Main.vue"

const routes = [
    {
        path: "/",
        component: Main,
        meta: {
            authRequired: true
        },
    },
    {
        path: "/login",
        component: Login,
        meta: {
            isSingle: true,
            authRequired: false
        },
    },
]



export default function (store: any) {
    const router = createRouter({
        history: createWebHistory(),
        routes,
    });

    router.beforeEach(async (to, from, next) => {
        if(to.matched.some(record => record.meta.authRequired)) {
            if (store.getters['auth/isAuthenticated']) {
                // await store.dispatch('auth/loadUserSettings');
                // await store.dispatch('config/load');
                next();
                return
            }
            next('/login')
        } else
            next()
    });

    return router
}