import { createRouter, createWebHistory } from "vue-router";
import Login from "./components/Login.vue";
import Main from "./components/Main.vue"

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
                store.dispatch('auth/loadUserSettings');
                next();
                return
            }
            next('/login')
        } else
            next()
    });

    return router
}