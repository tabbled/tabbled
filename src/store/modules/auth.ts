const state = () => ({
    user: null,
    loggedIn: false,
    token: localStorage.getItem('token') || '',
    account: null
})

const getters = {
    settings: (state: any) => {
        return state.user.settings
    },
    user: (state: any) => {
        return state.user
    },
    isAuthenticated: (state: any) => {
        return !!state.token
    },
    account: (state: any) => {
        return state.account
    },
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
        localStorage.removeItem('account_id')
        state.loggedIn = true
        state.token = token
        this.$socket.disconnect()
        this.$socket.connect()
    },

    loggedOut (state: any) {
        localStorage.removeItem('token')
        localStorage.removeItem('account_id')
        state.loggedIn = false
        state.token = ""
    },

    userLoaded(state: any, user: any) {
        state.user = user
        console.log('user', user)

        let account_id = localStorage.getItem('account_id')

        if (!user.accounts) {
            state.account = null
            localStorage.removeItem('account_id')
            return;
        }

        if (!account_id) {
            state.account = user.accounts[0];
            localStorage.setItem('account_id', state.account.id)
        } else {
            for(let i in user.accounts) {
                if (user.accounts[i].id === account_id) {
                    state.account = user.accounts[i]
                }
            }
        }

        // Need to reconnect for update socket auth
        if (account_id !== localStorage.getItem('account_id')) {
            this.$socket.disconnect()
            this.$socket.connect()
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}