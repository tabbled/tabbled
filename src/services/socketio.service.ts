import { io } from "socket.io-client";
import {Socket} from "socket.io-client/build/esm/socket";
let socket: Socket;

let protocol = (location.protocol === "https:") ? "wss://" : "ws://";
let wsHost;
const env = process.env.NODE_ENV || "production";
if (env === "development" || localStorage.dev === "dev") {
    wsHost = protocol + location.hostname + ":3001";
} else {
    wsHost = protocol + location.host;
}

socket = io(wsHost,{
    transports: [ 'websocket', 'polling' ],
    auth: (cb) => {
        cb({
            jwt: localStorage.getItem('token')
        })
    }
});

export default socket;