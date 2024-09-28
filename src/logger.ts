import {createConsola} from "consola";
import {ref, unref, UnwrapRef} from "vue";
import {ConsolaInstance} from "consola/core";

const getLogLevel = () => {
    //@ts-ignore
    let level = import.meta.env.MODE === 'production' ? 1 : 999
    const stored = localStorage.getItem('logLevel')
    if (stored) {
        level = Number(stored)
    }
    return level
}

const instance = ref<ConsolaInstance>(createConsola({

    level: getLogLevel()
}));



export function useLogger():UnwrapRef<ConsolaInstance> {
    return unref(instance)
}