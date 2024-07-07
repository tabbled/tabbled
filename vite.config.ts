import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag) => tag.includes('tb-')
            }
        }
    }),
        vueJsx(),
    ],
    resolve: {
        alias: {
            buffer: 'buffer/',
            vue: 'vue/dist/vue.esm-bundler.js'
        }
    },
})
