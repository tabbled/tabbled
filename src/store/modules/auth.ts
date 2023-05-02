import {Commit} from "vuex";
import {useSocketClient} from "../../services/socketio.service";
let socketClient = useSocketClient();

const state = () => ({
    user: getStoredUser(),
    loggedIn: false,
    token: localStorage.getItem('token') || '',
    account: getStoredAccount(),
})

function getStoredAccount() {
    let acc = localStorage.getItem('account')
    return acc ? JSON.parse(acc) : null
}

function getStoredUser() {
    let user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
}

const getters = {
    settings: (state: any) => {
        return state.user.settings
    },
    user: (state: any) => {
        return state.user
    },
    isAuthenticated: (state: any) => {
        return !!state.token && state.account
    },
    account: (state: any) => {
        return state.account
    },
}

const actions = {
    login ({ commit }: { commit: Commit }, user: any) {
        return new Promise((resolve, reject) => {
            socketClient.socket.timeout(1000).emit("login", {
                username: user.username,
                password: user.password
            }, (err: any, res: any) => {
                if (!err && res && res.success === true) {
                    commit('loggedIn', res.jwt)
                    resolve(res)

                } else {
                    console.error(res)
                    reject(res && res.error_message || 'Login error')
                }

            })
        });
    },

    loadUserSettings({ commit }: { commit: Commit }) {
        return new Promise((resolve, reject) => {
            socketClient.socket.timeout(300).emit("users/me", {},
                (err: any, res: any) => {
                if (!err && res && res.success === true) {
                    commit('userLoaded', res.user)

                    resolve(res.user)
                } else {
                    console.error(res)
                    reject((res && res.error_message) || 'Error loading user settings')
                }

            })
        });
    },

    async logout({ commit }: { commit: Commit }) {
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
        socketClient.updateAuth()
    },

    loggedOut (state: any) {
        localStorage.removeItem('token')
        localStorage.removeItem('account')
        state.loggedIn = false
        state.token = ""
    },

    userLoaded(state: any, user: any) {
        state.user = user
        localStorage.setItem('user', JSON.stringify(state.user))

        let account = getStoredAccount()

        if (!user.accounts) {
            state.account = null
            localStorage.removeItem('account')
            return;
        }

        if (!account) {
            state.account = user.accounts[0];
            localStorage.setItem('account', JSON.stringify(state.account))
            socketClient.updateAuth()
        } else if (account.id !== state.account.id) {// Need to reconnect socket client if current account was changed
            socketClient.updateAuth()
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