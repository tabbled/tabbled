import { createRouter, createWebHistory } from "vue-router";
import Login from "./components/Login.vue";

const routes = [
    {
        path: "/",
        component: Login,
    },
]

export const router = createRouter({
    linkActiveClass: "active",
    history: createWebHistory(),
    routes,
});