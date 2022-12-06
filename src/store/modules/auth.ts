const state = () => ({
    user: null,
    loggedIn: false,
    token: localStorage.getItem('token') || ''
})

const getters = {
    isLoggedIn: (state: any) => {
        return state.token || state.loggedIn
    },
    isAuthenticated: (state: any) => {
        return !!state.token
    }

}

const actions = {
    login ({ commit }, user: any) {
        return new Promise((resolve, reject) => {
            this.$socket.timeout(5000).emit("login", {
                username: user.username,
                password: user.password
            }, (err: any, res: any) => {
                if (!err && res && res.success === true) {
                    commit('loggedIn', res.jwt)
                    resolve(res)

                } else
                    reject(res.error_message || 'Login error')
            })
        });
    },

    loadUserSettings({commit}) {
        return new Promise((resolve, reject) => {
            this.$socket.timeout(5000).emit("users/me", {},
                (err: any, res: any) => {
                if (!err && res && res.success === true) {
                    commit('userLoaded', res.user)
                    resolve(res.user)
                } else
                    reject((res && res.error_message) || 'Error loading user settings')
            })
        });
    },

    async logout({ commit }) {
        localStorage.removeItem("token");
        commit('loggedOut')
    }
}

// mutations
const mutations = {
    loggedIn (state: any, token: string) {
        localStorage.setItem('token', token)
        state.loggedIn = true
        state.token = token
        this.$socket.disconnect()
        this.$socket.connect()
    },

    loggedOut (state: any) {
        localStorage.removeItem('token')
        state.loggedIn = false
        state.token = ""
    },

    userLoaded(state: any, user: any) {
        state.user = user
        console.log('user', user)
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}