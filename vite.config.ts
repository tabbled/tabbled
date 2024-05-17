import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag) => tag.includes('tb-')
            }
        }
    }),
        NodeGlobalsPolyfillPlugin({
            buffer: true
        })
    ],
    resolve: {
        alias: {
            buffer: 'buffer/',
            vue: 'vue/dist/vue.esm-bundler.js'
        }
    },
})
