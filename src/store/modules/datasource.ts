import {DataSourceInterface} from "../../model/datasource";

export interface DataSourceStateInterface {
    items: Map<string, DataSourceInterface>
}

const state = (): DataSourceStateInterface => ({
    items: new Map<string, DataSourceInterface>()
})

const getters = {
    getByAlias: (state: DataSourceStateInterface) => (alias: string) : DataSourceInterface | undefined => {
        return  state.items.get(alias)
    }
}

const actions = {

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