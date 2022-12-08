const state = () => ({
    config: {
        entities: [],
        models: [],
        reportTemplates: [],
    },
    isLoaded: false
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
    },
    isLoaded: (state: any) => {
        return state.isLoaded
    },
}

const actions = {
    load({commit}) {
        commit('notLoaded')
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
        state.isLoaded = true;
    },
    notLoaded (state: any) {
        state.config = {}
        state.isLoaded = true;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}