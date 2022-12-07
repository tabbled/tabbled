const state = () => ({
    config: {
        entities: [],
        models: [],
        reportTemplates: []
    }
})

const getters = {
    entities: (state: any) => {
        return state.config.entities
    },
    models: (state: any) => {
        return state.config.models
    },
    reportTemplates: (state: any) => {
        return state.config.reportTemplates
    }
}

const actions = {
    load({commit}) {
        return new Promise((resolve, reject) => {
            this.$socket.timeout(5000).emit("getConfiguration", {},
                (err: any, res: any) => {
                if (!err && res && res.success === true) {
                    commit('configLoaded', res.config)
                    resolve(res)
                } else
                    reject((err && err.error_message) || 'Error loading configuration')
            })
        });
    }
}

// mutations
const mutations = {
    configLoaded (state: any, config: any) {
        state.config = config
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}