import { defineStore, acceptHMRUpdate } from 'pinia'
import {PageConfigInterfaceV2} from "../model/page";
import {useApiClient} from "../services/api.service";
import {ComponentPropertiesHelper} from "../model/component";
import _ from "lodash"
import {useComponents} from "./componentStore";
import {ElMessage} from "element-plus";
import {watch} from "vue";
import {DataSet} from "../components/dataset";

const api = useApiClient()
let components = null


interface State {
    properties: PageConfigInterfaceV2,
    isLoading: boolean,
    loaded: boolean
    propertiesPanelVisible: boolean,
    propertiesHelper: ComponentPropertiesHelper
    propertiesPath: string,
    datasets: {
        [key in string]: DataSet
    }
}

export const usePage = defineStore('page', {

    state: (): State => {
        return {
            properties: null,
            propertiesPanelVisible: false,
            propertiesHelper: null,
            propertiesPath: "",
            isLoading: false,
            loaded: false,
            datasets: {}
        }
    },

    actions: {
        async loadByAlias(alias: string) {
            this.loaded = false
            this.properties = null
            let res = (await api.get(`/v2/pages/${alias}`)).data

            if (res.statusCode !== 200) {
                this.isLoading = false
                throw "Page not found"
            }

            let props = res.page

            //Set default values if it skipped
            let components = useComponents()

            for(const i in props.elements) {
                let el = props.elements[i]
                let helper = components.helpers.get(el.componentName)

                for(const j in helper.propertiesDef()) {
                    const def = helper.propertiesDef()[j]
                    if (!_.has(el,'properties.' + def.path)) {
                        _.set(el, 'properties.' + def.path, def.default())
                    }
                }

                //console.log(el)

            }
            //console.log(props)
            this.properties = props

            this.updateDataSets()

            this.loaded = true

        },


        openSettings(path, componentName) {
            if (!components)
                components = useComponents()

            this.propertiesHelper = components.helpers.get(componentName)

            if (!this.propertiesHelper) {
                const e = new Error("Property helper doesn't found for component " + componentName)
                ElMessage.error(e.toString())
                throw e
            }

            this.propertiesPath = path

            this.propertiesHelper.setProperties(path
                ? _.get(this.properties, this.propertiesPath)
                : this.properties,
                this.properties)
            this.propertiesPanelVisible = true

            watch(() => this.properties.datasets,
                async () => {
                    this.updateDataSets()
                })

        },

        closeSetting() {
            this.propertiesPanelVisible = false
            this.propertiesHelper = null
        },

        setProperty(path: string, value: any) {
            _.set(this.properties, `${this.propertiesPath ? this.propertiesPath + "."  : ""}${path}`, value)
        },

        updateDataSets() {
            for(const i in this.properties.datasets) {
                let ds:DataSet
                if (_.has(this.datasets, this.properties.datasets[i].alias)) {
                    ds = this.properties.datasets[i]
                } else {
                    ds = new DataSet()
                    this.datasets[this.properties.datasets[i].alias] = ds
                }
                ds.props = this.properties.datasets[i]
            }

            console.log("<<<!")
            console.log(this.datasets)
        }

    }
})

// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(acceptHMRUpdate(usePage, import.meta.hot))
}