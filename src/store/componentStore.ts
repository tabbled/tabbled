import { defineStore, acceptHMRUpdate } from 'pinia'
import {ComponentPropertiesHelper, Component} from "../model/component";
import { defineAsyncComponent } from 'vue'
import PageHelper from "../components/page/helper"
import ColumnHelper from "../components/column/helper"
import DataSetHelper from "../components/dataset/helper"
import TableV2Helper from "../components/table-v2/helper"
import FilterPanelHelper from "../components/filter-panel/helper"
import HighlightRowHelper from "../components/highlight-row/helper"

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
                this.helpers.set('Page', new PageHelper)
                this.helpers.set('Column', new ColumnHelper)
                this.helpers.set('Dataset', new DataSetHelper)
                this.helpers.set('TableV2', new TableV2Helper)
                this.helpers.set('FilterPanel', new FilterPanelHelper)
                this.helpers.set('HighlightRow', new HighlightRowHelper)

                app.component('TableV2', defineAsyncComponent(() =>
                    import("../components/table-v2/TableV2.element.vue")
                ))
                app.component('FilterPanel', defineAsyncComponent(() =>
                    import("../components/filter-panel/FilterPanel.element.vue")
                ))

                this.loaded = true
            } catch (e) {
                console.error(e)
                throw e
            }
        },

        // async registerRemote(url, app) {
        // //
        //
        //     const comp = defineAsyncComponent( () => {
        //
        //         return new Promise(async (resolve, reject) => {
        //             // ...load component from server
        //             console.log("<<<")
        //             let c = await api.get(url)
        //
        //             console.log(c.data)
        //
        //             resolve({
        //                 name: "TestComponent",
        //                 template: c.data,
        //                 setup: () => {
        //
        //                 }
        //             })
        //
        //         })
        //     })
        //
        //     console.log('registerRemote', url)
        //
        //     app.component('TestComponent', comp)
        // }
    }
})

// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(acceptHMRUpdate(useComponents, import.meta.hot))
}