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

                    <el-menu
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
                                    <span class="iconify" :data-icon="'mdi:'+menu.icon" style="width: 18px; height: 18px; margin-right: 8px"></span>
                                    <span>{{menu.label}}</span>
                                </template>
                            </el-menu-item>
                        </div>
                    </el-menu>

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

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    data() {
        return {
            menuItems: [{
                label: "",
                key: "",
                icon: "",
                items: []
            }]
        }
    },
    mounted() {
        console.log("mounted app")
    },
    created() {
        this.$store.subscribe((mutation: any) => {
            if (mutation.type === 'config/configLoaded') {
                console.log("configLoaded")
                this.loadMenu()
            }
        });
    },
    methods: {
        async login() {

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
            console.log(this.$store.getters['config/entities'])

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

    .el-menu {
        border-right: none;
    }
}

.main-router-view {
    box-shadow: 0 1px 6px 1px var(--el-border-color);
    z-index: 100;
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
