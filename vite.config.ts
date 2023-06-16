import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                // treat all tags with a dash as custom elements
                isCustomElement: (tag) => tag.includes('t-')
            }
        }
    })],
    resolve: {
        alias: {
            buffer: 'buffer/',
            vue: 'vue/dist/vue.esm-bundler.js'
        }
    }
})
