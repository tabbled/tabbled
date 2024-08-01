import {ref} from "vue";


export class SettingsPanel {
    panelEl = null
    setPanelElement(el: Element) {
        console.log(el)
        this.panelEl = el
    }

    openWidget(el) {
        console.log(el)
        this.panelEl.setActiveWidget(el)
    }
}

let instance = ref<SettingsPanel>(new SettingsPanel())

export function useSettingsPanel() : SettingsPanel {
    return instance.value
}