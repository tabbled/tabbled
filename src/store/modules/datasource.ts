import {DataSourceConfigInterface, DataSourceInterface} from "../../model/datasource";
//import { useDataSourceService } from "../../services/datasource.service";

export interface DataSourceStateInterface {
    items: Map<string, DataSourceInterface>
}

const state = (): DataSourceStateInterface => ({
    items: new Map<string, DataSourceInterface>()
})

const getters = {
    getByAlias: ( state: DataSourceStateInterface ) => (alias: string) : DataSourceInterface | undefined => {
        return  state.items.get(alias)
    }
}

const actions = {
    load ( state: any, dataSources: DataSourceConfigInterface[] ) {
        console.log(dataSources)
    }
}

const mutations = {

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}