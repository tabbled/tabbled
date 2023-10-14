import {ref} from "vue";
import {useSocketClient} from "./socketio.service";
import _package from '../../package.json'

const socket = useSocketClient()

export class Settings {
    version: string
    serverVersion: string

    async refresh() {
        let res = await socket.emit('getSettings')

        this.version = _package.version
        this.serverVersion = res.version
    }
}

let instance = ref<Settings>(new Settings())

export function useSettings() : Settings {
    return instance.value
}