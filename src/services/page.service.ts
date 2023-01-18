import {ref, UnwrapRef} from "vue";
import {Router} from "vue-router";


export interface PageButtonActionInterface {
    title: string,
    type?: "default" | "primary" | "success" | "warning" | "info" | "danger",
    func: Function
}

export class PageActions {
    constructor() {
        this.buttons = []
    }
    buttons: PageButtonActionInterface[]
}

class PageScriptHelper {
    private _router:Router = null
    constructor(router: Router) {
        this._router = router
    }
    open(alias: string) {
        console.log(alias)
        this._router.push('/')
    }
}

let pageActions = ref<PageActions>(new PageActions())

export function usePagesActions(): UnwrapRef<PageActions> {
    return pageActions.value
}

export function usePageScriptHelper(router: Router):PageScriptHelper {
    return new PageScriptHelper(router)
}