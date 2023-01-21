import {ref, unref, UnwrapRef} from "vue";
import {ComponentInterface} from "../model/page";

export interface ComponentTitle {
    name: string,
    title: string
}

export class ComponentService {
    private _components: Map<string, ComponentInterface> = new Map()

    getByName(name: string): ComponentInterface | undefined {
        return this._components.get(name)
    }

    getList(): ComponentTitle[] {
        let list:ComponentTitle[] = []
        this._components.forEach(item => {
            list.push({
                name: item.name,
                title: item.title
            })
        })
        return list;
    }

    registerComponent(component: ComponentInterface) {
        if (this._components.has(component.name)) {
            console.warn(`Component "${component.name}" already exists. That will be replaced`)
        }
        this._components.set(component.name, component)
        console.log(`Component ${component.name} is registered`)
    }
}

const instance = ref<ComponentService>(new ComponentService());

export function useComponentService():UnwrapRef<ComponentService> {
    return unref(instance)
}