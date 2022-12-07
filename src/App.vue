<script setup lang="ts">

</script>

<template>
    <div v-if="$route.meta.isSingle" class="single-page" >
        <router-view />
    </div>


    <el-container v-else class="main">
        <el-container>
            <el-aside width="250px">
                <el-header height="auto" style="margin: 16px; --el-header-padding: 0">
                    <el-col >
                        <el-row align="middle">
                            <img height="30" src="./assets/tabbled_icon.svg" alt=""/>
                            <div style="margin-left: 8px">Tabbled</div>
                        </el-row>
                    </el-col>



                </el-header>
                <el-divider style="margin: 0"/>
                Aside
                <div class="footer " style="box-shadow: #535bf2">
                    Footer
                </div>
            </el-aside>
            <el-container >
                <el-main class="main-router-view">
                    <router-view/>
                </el-main>
            </el-container>
        </el-container>
    </el-container>
<!--    <div class="locale-changer">-->
<!--        <select v-model="$i18n.locale">-->
<!--            <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>-->
<!--        </select>-->
<!--    </div>-->
</template>

<style lang="scss">

.single-page {
    margin: auto;
    width: 100vw;
}

.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200px;
}

.main {
    margin: 0;
    padding: 0;
    width: 100vw;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.main-router-view {
    box-shadow: 0 1px 6px 1px var(--el-border-color);
}

html,
body {
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#app {
    padding: 0 !important;
    margin: 0 !important;
}

</style>
