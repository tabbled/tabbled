import { defineStore, acceptHMRUpdate } from 'pinia'
import {PageConfigInterfaceV2} from "../model/page";
import {useApiClient} from "../services/api.service";
import {ComponentPropertiesHelper} from "../model/component";
let api = useApiClient()
import _ from "lodash"

interface State {
    properties: PageConfigInterfaceV2,
    propertiesPanelVisible: boolean,
    propertiesHelper: ComponentPropertiesHelper
    propertiesPath: string
}

export const usePage = defineStore('page', {

    state: (): State => {
        return {
            properties: null,
            propertiesPanelVisible: false,
            propertiesHelper: null,
            propertiesPath: ""
        }
    },

    actions: {
        async loadByAlias(alias: string) {
            let res = (await api.get(`/v2/pages/${alias}`)).data

            if (res.statusCode !== 200) {
                throw "Page not found"
            }

            this.properties = res.page
        },


        openSettings(path, helper) {
            console.log('openSettings')
            this.propertiesHelper = helper
            this.propertiesPath = path
            this.propertiesHelper.setProperties(_.get(this.properties, this.propertiesPath))
            this.propertiesPanelVisible = true
        },

        closeSetting() {
            this.propertiesPanelVisible = false
            this.propertiesHelper = null
        },

        setProperty(path: string, value: any) {
            _.set(this.properties, `${this.propertiesPath ? this.propertiesPath + "."  : ""}${path}`, value)
        }

    }
})

// @ts-ignore
if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.accept(acceptHMRUpdate(usePage, import.meta.hot))
}