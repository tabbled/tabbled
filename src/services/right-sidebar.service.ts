import {ref} from "vue";
import {PropertiesHelper} from "../components/tableV2/config";


export class RightSidebar {
    panelEl = null
    setPanelElement(el: Element) {
        this.panelEl = el
    }

    openWidget(el) {
        this.panelEl.setActiveWidget(el)
    }

    openSettingsOf(helper:PropertiesHelper) {
        this.panelEl.openSettingsOf(helper)
    }

    close() {
        this.panelEl.close()
    }
}

let instance = ref<RightSidebar>(new RightSidebar())

export function useRightSidebar() : RightSidebar {
    return instance.value
}