import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [vue(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script',
            filename: "sw.ts",
            strategies: "injectManifest",
            includeAssets: ["/favicon.png"],
            srcDir: "src",
            base: '/',
            workbox: {
                cleanupOutdatedCaches: true,
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
            },
            manifest: {
                "id": "tabbled.org",
                "name": "Tabbled - low-code platform for everyone",
                "short_name": "Tabbled",
                "start_url": "index.html",
                "display": "standalone",
                "icons": [
                    {
                        "src": "/favicon.png",
                        "type": "image/png",
                        "sizes": "256x256"
                    }
                ]
            }
        })],
    resolve: {
        alias: {
            buffer: 'buffer/',
        }
    },
    server: {
        port: 5173
    }
})
