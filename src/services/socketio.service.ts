import { io } from "socket.io-client";
import {Socket} from "socket.io-client/build/esm/socket";
import { ref } from 'vue'

let protocol = (location.protocol === "https:") ? "wss://" : "ws://";
let wsHost;
const env = process.env.NODE_ENV || "production";
if (env === "development" || localStorage.dev === "dev") {
    wsHost = protocol + location.hostname + ":3001";
} else {
    wsHost = protocol + location.host;
}

const socketInstance = ref<Socket>(io(wsHost,{
    transports: [ 'websocket', 'polling' ],
    auth: (cb) => {
        cb({
            jwt: localStorage.getItem('token'),
            account_id: Number(localStorage.getItem('account_id')),
        })
    }
}));

export function useSocket() {
    return socketInstance.value
}