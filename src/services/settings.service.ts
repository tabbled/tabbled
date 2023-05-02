import {ref} from "vue";
import {useSocketClient} from "./socketio.service";
import _package from '../../package.json'

const socket = useSocketClient()

export class Settings {
    favicon: string = localStorage.getItem('favicon')
    title: string = localStorage.getItem('title')
    version: string
    serverVersion: string

    async refresh() {
        let res = await socket.emit('getSettings')

        this.favicon = res.favicon
        this.title = res.title
        this.version = _package.version
        this.serverVersion = res.version

        localStorage.setItem('favicon', this.favicon)
        localStorage.setItem('title', this.title)
    }
}

let instance = ref<Settings>(new Settings())

export function useSettings() : Settings {
    return instance.value
}