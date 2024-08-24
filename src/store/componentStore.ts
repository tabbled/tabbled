import { defineStore, acceptHMRUpdate } from 'pinia'
import {ComponentPropertiesHelper, Component} from "../model/component";
import { defineAsyncComponent } from 'vue'

interface State {
    helpers: Map<string, ComponentPropertiesHelper>
    components: Component[],
    loaded: boolean
}

export const useComponents = defineStore('components', {
    state: (): State => {
        return {
            helpers: new Map(),
            components: [],
            loaded: false
        }
    },
    actions: {
        async registerAll(app) {
            try {
                this.helpers.set('Page', new ((await import("../components/page/helper")).default))

                await this.registerOne('TableV2', "./../components/tableV2", app)

                this.loaded = true
            } catch (e) {
                console.error(e)
                throw e
            }
        },
        async registerOne(name, path, app) {
            const comp = defineAsyncComponent(() =>
                import(`${path}/${name}.element.vue`)
            )
            app.component(name, comp)
//component: defineAsyncComponent(() => import('component'))
            this.helpers.set(name, new ((await import(`${path}/helper`)).default))
            this.components.push(new ((await import(`${path}/config`)).default))
        }
    }
})

// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(acceptHMRUpdate(useComponents, import.meta.hot))
}