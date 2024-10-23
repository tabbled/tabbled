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
    properties: PageConfigInterfaceV2
    isLoading: boolean
    isPropsChanged: boolean
    loaded: boolean
    propertiesPanelVisible: boolean,
    propertiesHelper: ComponentPropertiesHelper
    propertiesPath: string,
    datasets: {
        [key in string]: DataSet
    }
    parentPath: string
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
            datasets: {},
            parentPath: null,
            isPropsChanged: false
        }
    },

    actions: {
        async loadByAlias(alias: string) {
            this.loaded = false
            this.properties = null
            this.isPropsChanged = false

            let res = (await api.get(`/v2/pages/${alias}`)).data

            if (res.statusCode !== 200) {
                this.isLoading = false
                throw "Page not found"
            }

            let props = res.page

            //Set default values if it undefined
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



            }
            this.properties = props

            await this.updateDataSets()

            this.loaded = true

        },


        openSettings(path: string, componentName: string, parentPath?: string) {
            if (!components)
                components = useComponents()

            console.log("openSettings, path:", path)

            this.propertiesHelper = components.helpers.get(componentName)

            if (!this.propertiesHelper) {
                const e = new Error("Property helper doesn't found for component " + componentName)
                ElMessage.error(e.toString())
                throw e
            }

            this.propertiesPath = path
            this.parentPath = parentPath

            let helper = components.helpers.get(componentName)

            for(const j in helper.propertiesDef()) {
                const def = helper.propertiesDef()[j]
                let p = `${path ? path + "."  : ""}${def.path}`
                if (!_.has(this.properties, p)) {
                    _.set(this.properties, p, def.default())
                }
            }

            this.propertiesHelper.setProperties(path
                ? _.get(this.properties, this.propertiesPath)
                : this.properties,
                this.properties)
            this.propertiesPanelVisible = true

            watch(() => this.properties.datasets,
                async () => {
                    await this.updateDataSets()
                })

        },

        closeSetting() {
            this.propertiesPanelVisible = false
            this.propertiesHelper = null
        },

        // Use it t update property value from settings panel
        setProperty(path: string, value: any) {
            let p = `${this.propertiesPath ? this.propertiesPath + "."  : ""}${path}`

            console.log(this.properties)

            console.log("setProperty, path '", p, "', value ", value, _.get(this.properties, p ))

            _.set(this.properties, p, value)

            this.isPropsChanged = true
        },

        // Use it to update property value directly from elements
        setPropertyByPath(path: string, value: any) {
            console.log("setPropertyByPath, path:", path, "value: ", value )
            _.set(this.properties, path, value)
            this.isPropsChanged = true
        },

        async updateDataSets() {
            for(const i in this.properties.datasets) {
                let ds:DataSet
                if (_.has(this.datasets, this.properties.datasets[i].alias)) {
                    ds = this.datasets[this.properties.datasets[i].alias]
                } else {
                    ds = new DataSet()
                    this.datasets[this.properties.datasets[i].alias] = ds
                }
                ds.props = _.cloneDeep(this.properties.datasets[i])
                await ds.getFields()


                ds.restoreFilter(localStorage.getItem(`${this.properties.id}_${ds.props.alias}_filterBy`))
                ds.onFilterUpdate = () => {
                    localStorage.setItem(`${this.properties.id}_${ds.props.alias}_filterBy`, ds.backupFilter())
                }
            }
        },

        async saveChanges() {
            try {
                await api.patch(`/v2/pages/${this.properties.id}`, this.properties)
                this.isPropsChanged = false
            } catch (e) {
                console.error(e)
                ElMessage.error({
                    message: e.toString()
                })
            }

        }



    }
})

// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(acceptHMRUpdate(usePage, import.meta.hot))
}