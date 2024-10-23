import { io } from "socket.io-client";
import {Socket} from "socket.io-client/build/esm/socket";
import { ref } from 'vue'

import {useLogger} from "../logger";
const logger = useLogger()

function getAccountId(): number {
    let acc = localStorage.getItem('account')
    return acc ? JSON.parse(acc).id : -1
}

export interface ServerInterface {
    emit(topic: string, message?: any) : Promise<any>
    socket: Socket
}

export class SocketIOClient implements ServerInterface {
    constructor() {
        let url = this.url()
        logger.log('Socket server url - ', url)
        this.socket = io(url,{
            transports: [ 'websocket', 'polling' ],
            auth: (cb) => {
                let accountId = getAccountId()
                cb({
                    jwt: localStorage.getItem('token'),
                    accountId: accountId,
                })
            }
        })



        this.socket.on("exception", (err) => {
            logger.error(err);
        });

        this.socket.on("connect_error", (err) => {
            logger.error(`Failed to connect to the backend. Socket.io connect_error: ${err.message}`);
        });

        this.socket.on("connect", async () => {
            logger.log("Connected to the socket server");
        })

        this.socket.on("disconnect", async () => {
            logger.log("Disconnected from the socket server");
        })


        // this.socket.on('functions/console.log', async (...args) => {
        //     logger.log('Func console.log: ', ...args)
        // })

        this.socket.on('updates', async(msg) => {

            logger.log('updates',msg)
        })
    }

    socket: Socket

    url(): string {
        // If url provided in env file then it passes to socket client
        // @ts-ignore
        let envUrl = import.meta.env.VITE_SERVER_WS
        if (envUrl && envUrl !== '')
            return envUrl

        let protocol = (location.protocol === "https:") ? "wss://" : "ws://";
        let url;
        // @ts-ignore
        const env = import.meta.env.MODE || "production";

        if (env === "development" || localStorage.dev === "dev") {
            url = protocol + location.hostname + ":3000";
        } else {
            url = protocol + location.host;
        }
        return url;
    }

    updateAuth() {
        logger.log('Socket server reconnecting...')
        this.socket.disconnect()
        this.socket.connect()
    }

    async emit(topic: string, message?: any) : Promise<any> {

         //const transaction = Sentry.startTransaction({ name: `emit /${topic}` });
         //const span = transaction.startChild({ name: `emit /${topic}`, data: { message: message } })

        try {
            //span.setStatus('ok')
            //transaction.setStatus('ok')
            return await this.emitting(topic, message)
        } catch (e) {
            //span.setStatus('error')
            //transaction.setStatus('error')
            //Sentry.captureException(e)
            throw e
        }
        finally {
            //span.finish()
            //transaction.finish()
        }
    }

    private async emitting(topic: string, message?: any) {
        return new Promise((resolve, reject) => {
            this.socket.timeout(10000).emit(topic, message || {},
                (err: any, res: any) => {
                    if (!err && res && res.success === true) {
                        resolve(res.data)
                    } else {
                        if (res && res.error_message)
                            reject(res.error_message)
                        else {
                            reject('Unknown error')
                            logger.error(`Error while emit\n topic: ${topic} \nmessage: ${JSON.stringify(message)}`)
                            logger.error('Error:')
                            logger.error(err)
                        }
                    }
                })
        });
    }
}




const instance = ref<SocketIOClient>(new SocketIOClient());

export function useSocketClient() {
    return instance.value
}