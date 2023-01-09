import { io } from "socket.io-client";
import {Socket} from "socket.io-client/build/esm/socket";
import { ref } from 'vue'

function getAccountId(): number {
    let acc = localStorage.getItem('account')
    return acc ? JSON.parse(acc).id : -1
}

export class SocketIOClient {
    constructor() {
        this.socket = io(this.url(),{
            transports: [ 'websocket', 'polling' ],
            auth: (cb) => {
                cb({
                    jwt: localStorage.getItem('token'),
                    accountId: getAccountId(),
                })
            }
        })

        this.socket.on("exception", (err) => {
            console.error(err);
        });

        this.socket.on("connect_error", (err) => {
            console.error(`!!!Failed to connect to the backend. Socket.io connect_error: ${err.message}`);
        });

        this.socket.on("connect", async () => {
            console.log("Connected to the socket server");
        })
    }

    readonly socket: Socket

    url(): string {
        let protocol = (location.protocol === "https:") ? "wss://" : "ws://";
        let url;
        const env = process.env.NODE_ENV || "production";

        if (env === "development" || localStorage.dev === "dev") {
            url = protocol + location.hostname + ":3000";
        } else {
            url = protocol + location.host;
        }
        return url;
    }

    updateAuth() {
        console.log('Socket server reconnecting...')
        this.socket.disconnect()
        this.socket.connect()
    }

    async emit(topic: string, message?: any) : Promise<any> {
        return new Promise((resolve, reject) => {
            this.socket.timeout(5000).emit(topic, message || {},
                (err: any, res: any) => {
                    if (!err && res && res.success === true) {
                        resolve(res.data)
                    } else
                        reject((res && res.error_message) || `Unknown error while emit\n topic: ${topic} \nmessage: ${JSON.stringify(message)}`)
                })
        });
    }
}




const instance = ref<SocketIOClient>(new SocketIOClient());

export function useSocketClient() {
    return instance.value
}