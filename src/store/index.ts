import { createStore, createLogger } from 'vuex'
import auth from './modules/auth'
import config from './modules/configuration'
import datasource from "./modules/datasource";

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
    modules: {
        auth,
        config,
        datasource
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
})