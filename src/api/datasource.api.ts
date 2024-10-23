import {ApiClient} from "../services/api.service";

export class DatasourceApi {
    constructor(api) {
        this.api = api
    }
    readonly api: ApiClient

    async getMany(version = 2) {
        let res = await this.api.get(`/v${version}/datasource`)
        console.log("DataSourceApi", res)
        if(res.status === 200) {
            return res.data.items
        } else {
            throw new Error(res.data.message)
        }
    }
}