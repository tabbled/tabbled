import { createStore, createLogger } from 'vuex'
import auth from './modules/auth'
import config from './modules/configuration'

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
    modules: {
        auth,
        config
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
})