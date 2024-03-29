import {ref, UnwrapRef} from "vue";
import {RouteParamsRaw, Router} from "vue-router";
import {useDataSourceService} from "./datasource.service";
import {PageConfigInterface} from "../model/page";

let dsService = useDataSourceService()

export interface PageActionsInterface {
    title: string,
    type?: "default" | "primary" | "success" | "warning" | "info" | "danger",
    func: Function
}

export class PageHeader {
    actions: PageActionsInterface[] = []
    title: string
}

class PageScriptHelper {
    constructor(router: Router) {
        this._router = router
        this._pageDataSource = dsService.pageDataSource
    }

    private _router:Router = null
    private _pageDataSource = null

    async open(alias: string, params: RouteParamsRaw | undefined) {
        let page = await <PageConfigInterface>this._pageDataSource.getByKey(alias)

        if (!page) {
            throw Error(`Page by alias "${alias}" not found`)
        }
        if (!page.path || page.path === "") {
            throw Error(`Page by alias "${alias}" doesn't have path`)
        }

        await this._router.push({ name: alias, params: params})
    }

    async design(id: string) {
        let page = await <PageConfigInterface>this._pageDataSource.getById(id)

        if (!page) {
            throw Error(`Page by id "${id}" not found`)
        }

        await this._router.push(`/designer/${page.id}`)
    }
}

let pageActions = ref<PageHeader>(new PageHeader())

export function usePageHeader(): UnwrapRef<PageHeader> {
    return pageActions.value
}

export function usePageScriptHelper(router: Router):PageScriptHelper {
    return new PageScriptHelper(router)
}
