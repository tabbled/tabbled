<template>
    <div v-if="route.meta.isSingle" style="width: 100vw" >
        <router-view />
    </div>
    <Main v-else />
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import Main from "./pages/Main.vue"
import {onMounted} from "vue";
import {useStore} from "vuex";

const store = useStore();
const route = useRoute();

onMounted(() => {
    store.dispatch('auth/loadUserSettings')
})

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
