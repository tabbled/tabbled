import {ref, markRaw} from 'vue'
import {EditPage, PageConfigInterface, PageInterface, PageType} from "../model/page";
import PageEditPage from './../pages/EditPage.vue'
import PageListPage from './../pages/ListPage.vue'

export class PageService {
    pagesByAlias: Map<string, PageInterface> = new Map<string, PageInterface>()

    constructor() { }

    registerPage(config: PageConfigInterface): PageInterface | undefined {
        let component = null
        switch (config.type) {
            case PageType.edit: component = markRaw(PageEditPage); break;
            case PageType.list:component = markRaw(PageListPage); break;
        }

        if (component) {
            let page = new EditPage(config, component)

            if (this.pagesByAlias.has(config.alias))
                console.warn(`Warn: registration page with alias ${config.alias} has been taken`)

            this.pagesByAlias.set(config.alias, page);

            return page;
        } else
            console.error(`Unknown page type ${config.type} for page ${config.alias}`);
    }

    getPageByAlias(alias: string): PageInterface | undefined {
        return this.pagesByAlias.get(alias)
    }

    getAll(): Array<PageInterface> {
        return [ ...this.pagesByAlias.values() ]
    }
}

let dsService = ref<PageService>(new PageService())

export function usePageService(): PageService {
    return dsService.value
}