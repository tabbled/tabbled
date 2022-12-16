<template>
    <div v-if="$route.meta.isSingle" class="single-page" >
        <router-view />
    </div>


    <el-container v-else class="main">
        <el-container>
            <el-aside width="250px" ref="aside">
                <el-header height="auto" style="margin: 16px; --el-header-padding: 0">
                    <el-col >
                        <el-row align="middle">
                            <img height="30" src="./assets/tabbled_icon.svg" alt=""/>
                            <div style="margin-left: 8px">Tabbled</div>
                        </el-row>
                    </el-col>

                </el-header>
                <el-divider style="margin: 0"/>

                    <el-menu
                        :collapse="isMenuCollapse"
                        :default-active="$route.fullPath"
                        :router="true"
                    >
                        <div v-for="menu in menuItems" :key="menu.label">
                            <el-sub-menu v-if="menu.items"
                                         :index="menu.label">
                                <template #title>
                                    <span class="iconify" :data-icon="'mdi:'+menu.icon" style="width: 18px; height: 18px; margin-right: 8px"></span>
                                    <span>{{menu.label}}</span>
                                </template>

                                <el-menu-item v-for="item in menu.items"
                                              :key="item.key"
                                              :index="item.to">
                                    <template #title>
                                        <span  style="width: 100%; text-align: left;">{{item.label }}</span>
                                        <div @click="$event.stopPropagation(); openInNewWindow(item.to);" class="open_new" style="width: 16px; height: 100%;">
                                            <span class="iconify " data-icon="mdi:open-in-new" style="width: 16px; height: 100%;"/>
                                        </div>
                                    </template>

                                </el-menu-item>
                            </el-sub-menu>
                            <el-menu-item v-else :index="menu.to" >
                                <template #title>
                                    <span class="iconify" :data-icon="'mdi:'+menu.icon" style="width: 18px; height: 18px; margin-right: 8px"/>
                                    <span>{{menu.label}}</span>
                                </template>
                            </el-menu-item>
                        </div>
                    </el-menu>

                <div class="footer ">
                    <el-menu @select="showUserMenu" :collapse="isMenuCollapse">

                        <el-menu-item index="1">
                            <span class="iconify" data-icon="mdi:user" style="width: 24px; height: 24px; margin-right: 8px"/>

                            <span style="width: 100%; text-align: start;">{{username()}}</span>
                            <div @click="logout" class="open_new" style="width: 16px; height: 100%;">
                                <span class="iconify " data-icon="mdi:exit-to-app" style="width: 24px; height: 100%;"/>
                            </div>
                        </el-menu-item>

<!--                        <el-menu-item index="1" @click="isMenuCollapse = !isMenuCollapse">-->
<!--                            <span style="width: 100%; text-align: start;">{{username()}}</span>-->
<!--                        </el-menu-item>-->

                    </el-menu>
                </div>
            </el-aside>
            <el-container>
                <el-col class="main-router-view" ref="mainContainer">

                    <el-page-header ref="mainHeader" style="margin: 16px" @back="$router.back()">
                        <template #content>
                            <span class="text-large font-600 mr-3"> Customers </span>
                        </template>

                        <template #extra>
                            <div class="flex items-center">
                                <el-button>Print</el-button>
                                <el-button type="primary" class="ml-2">Edit</el-button>
                            </div>
                        </template>
                    </el-page-header>
                    <el-main>
                        <el-scrollbar :height="mainViewHeight">
                            <router-view/>

                        </el-scrollbar>


                    </el-main>
                </el-col>
            </el-container>
        </el-container>
    </el-container>
<!--    <div class="locale-changer">-->
<!--        <select v-model="$i18n.locale">-->
<!--            <option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}</option>-->
<!--        </select>-->
<!--    </div>-->
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    data() {
        return {
            mainViewHeight: 0,
            menuItems: [{
                label: "",
                key: "",
                icon: "",
                items: []
            }],
            isMenuCollapse: false
        }
    },
    mounted() {
        this.mainViewHeight = this.$refs.mainContainer.$el.clientHeight - this.$refs.mainHeader.$el.clientHeight
        //this.loadMenu()

    },
    created() {
        //console.log("created app")
        if (this.$store.getters['config/isLoaded']) {
            this.loadMenu()
        }
        //console.log(this.$store.getters['auth/user'])
        this.$store.subscribe((mutation: any) => {
            if (mutation.type === 'config/configLoaded') {
                this.loadMenu()
            }
        });
    },
    methods: {
        logout() {
            this.$store.dispatch('auth/logout')
                .then(()=>{
                    this.$router.push('/login')
                })
        },
        showUserMenu(){
            console.log("showUserMenu")
        },
        username(): string {
            return this.$store.getters['auth/user'] ? this.$store.getters['auth/user'].username : ""
        },
        openInNewWindow(to: string) {
            let route = this.$router.resolve({ path: to });
            window.open(route.href);
        },
        fillMenu(alias: number, items: object[]) {
            let menu_arr: object[] = [];
            items.forEach(item => {
                menu_arr.push({
                    key: item.code,
                    label: item.title,
                    to: `/${alias}/${item.alias}`,
                })
            });

            return menu_arr
        },
        loadMenu() {
            this.menuItems = []

            let entities = {
                label: this.$t('entities'),
                key: "entities",
                icon: "text-box-outline",
                items: this.fillMenu('entities', this.$store.getters['config/entities'])
            }

            this.menuItems.push(entities)

            if (this.$store.getters['auth/account'].permissions.admin) {
                this.menuItems.push(
                    // {
                    //     label: this.$t('settings'),
                    //     icon: 'cog-outline',
                    //     to: `/system-settings`,
                    // },
                    {
                        label: this.$t('configuration'),
                        icon: 'application-brackets-outline',
                        items: [
                            {
                                label: this.$t('tableModels'),
                                to: `/configuration/models`,
                            },
                            {
                                label: this.$t('reportTemplates'),
                                to: `/configuration/report-templates`,
                            },
                        ]
                    })
            }
        }
    }
})
</script>

<style lang="scss">

.open_new {
    color: var(--el-border-color);
    border-radius:unset;
    align-content: center;
}

.single-page {
    margin: auto;
    width: 100vw;
}

.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 250px;
}

.main {
    margin: 0;
    padding: 0;
    width: 100vw;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    .el-menu {
        border-right: none;
    }
}

.main-router-view {
    box-shadow: var(--el-box-shadow-light);
    z-index: 100;
    height: 100%;
    width: calc(100% - 250px);
    position: absolute;
    overflow: hidden
}

.el-sub-menu__title {
    height: 40px !important;
    line-height: 40px !important;
}

.el-sub-menu .el-menu-item {
    height: 40px !important;
    line-height: 40px !important;
}


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
}

</style>
