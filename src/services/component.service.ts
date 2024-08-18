/* This is the old version if component registry, see new on ./store/componentStore
*  */

import {ref, unref, UnwrapRef} from "vue";
import {ComponentInterface} from "../model/page";

import {Config as TableConfig} from '../components/configuration/table.config'
import {Config as LinkSelectConfig} from '../components/configuration/link-select.config'
import {Config as CodeEditorConfig} from '../components/configuration/code-editor.config'
import {Config as CheckboxConfig} from '../components/configuration/checkbox.config'
import {Config as InputConfig} from '../components/configuration/input.config'
import {Config as DatetimeInputConfig} from '../components/configuration/datetime-select.config'
import {Config as ImageFieldProps} from '../components/configuration/image-field.config'
import {Config as StatusFilterProps} from '../components/configuration/status.filter.config'
import {Config as TreeFilterProps} from '../components/configuration/tree.filter.config'
import {Config as FileFieldProps} from '../components/configuration/file-field.config'
import {Config as RichTextEditorProps} from '../components/configuration/rich-text-editor.config'

export interface ComponentTitle {
    name: string,
    title: string,
    icon?: string
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
                title: item.title,
                icon: item.icon
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

    registerAllComponents() {
        this.registerComponent(new TableConfig)
        this.registerComponent(new LinkSelectConfig)
        this.registerComponent(new CodeEditorConfig)
        this.registerComponent(new CheckboxConfig)
        this.registerComponent(new InputConfig)
        this.registerComponent(new DatetimeInputConfig)
        this.registerComponent(new ImageFieldProps)
        this.registerComponent(new FileFieldProps)
        this.registerComponent(new StatusFilterProps)
        this.registerComponent(new TreeFilterProps)
        this.registerComponent(new RichTextEditorProps)
    }
}


const instance = ref<ComponentService>(new ComponentService());

export function useComponentService():UnwrapRef<ComponentService> {
    return unref(instance)
}