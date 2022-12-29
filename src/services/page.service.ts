import {ref} from "vue";

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

let pageActions = ref<PageActions>(new PageActions())

export function usePagesActions(): PageActions {
    return pageActions.value
}