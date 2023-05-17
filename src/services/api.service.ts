import { ref } from 'vue'
import axios, {AxiosInstance, AxiosRequestConfig} from "axios";

export class ApiClient {
    constructor() {
        this.axios = axios.create({
            baseURL: this.url()
        })
    }

    private axios: AxiosInstance

    private updateHeaders() {
        let token = localStorage.getItem('token')
        if (token) {
            this.axios.defaults.headers.common['Authorization'] = `Bearer ` + token
        }

        let acc = this.getAccountId()
        if (acc) {
            this.axios.defaults.headers.common['x-account-id'] = acc
        }
    }

    private getAccountId(): number {
        let acc = localStorage.getItem('account')
        return acc ? JSON.parse(acc).id : null
    }

    async get(url: string, config?: AxiosRequestConfig) {
        this.updateHeaders()
        return await this.axios.get(url, config)
    }

    async post(url: string, data: any, config?) {
        this.updateHeaders()
        return await this.axios.post(url, data, config)
    }

    url(): string {
        // @ts-ignore
        let envUrl = import.meta.env.VITE_SERVER_API
        if (envUrl && envUrl !== '')
            return envUrl

        let url;
        // @ts-ignore
        const env = import.meta.env.MODE || "production";

        if (env === "development" || localStorage.dev === "dev") {
            url = "http://localhost:3000";
        } else {
            url = location.protocol + '//api.' + location.host;
        }
        return url;
    }
}

const instance = ref<ApiClient>(new ApiClient());

export function useApiClient() {
    return instance.value
}