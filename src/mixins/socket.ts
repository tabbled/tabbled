import { io } from "socket.io-client";
import {defineComponent} from "vue";
import {Socket} from "socket.io-client/build/esm/socket";
import jwtDecode from "jwt-decode";

let socket: Socket;

export default defineComponent ( {
    data() {
        return {
            socket: {
                token: null,
                firstConnect: true,
                connected: false,
                connectCount: 0,
                initedSocketIO: false
            },
            username: "",
            loggedIn: false,
            allowLoginDialog: false,
            connectionErrorMsg: "Cannot connect to the socket server. Reconnecting...",
        }
    },

    created() {
        this.initSocketIO();
    },

    methods: {
        /**
         * Initialize connection to socket server
         * @returns {(void|null)}
         */
        initSocketIO() {
            //No need to re-init
            if (this.socket.initedSocketIO) {
                return;
            }
            this.socket.initedSocketIO = true;

            let protocol = (location.protocol === "https:") ? "wss://" : "ws://";

            let wsHost;
            const env = process.env.NODE_ENV || "production";
            if (env === "development" || localStorage.dev === "dev") {
                wsHost = protocol + location.hostname + ":3001";
            } else {
                wsHost = protocol + location.host;
            }
            socket = io(wsHost, {
                transports: [ 'websocket', 'polling' ],
                auth: {
                    "jwt": this.socket.token
                }
            });

            socket.on("exception", (err) => {
                console.error(err);
                this.$root.$notify({
                    title: 'Error',
                    message: err.error,
                    showClose: true,
                    type: 'error',
                })
            });

            socket.on("connect_error", (err) => {
                console.error(`Failed to connect to the backend. Socket.io connect_error: ${err.message}`);
                this.connectionErrorMsg = `Cannot connect to the socket server. [${err}] Reconnecting...`;
                this.socket.connected = false;
                this.socket.firstConnect = false;
            });

            socket.on("disconnect", () => {
                console.log("disconnect");
                this.connectionErrorMsg = "Lost connection to the socket server. Reconnecting...";
                this.socket.connected = false;
            });

            socket.on("connect", () => {
                console.log("Connected to the socket server");
                this.socket.connectCount++;
                this.socket.connected = true;

                let token = localStorage.getItem('token');

                if (token) {
                    if (token !== "autoLogin") {
                        this.loginByToken(token);
                    } else {
                        // Timeout if it is not actually auto login
                        setTimeout(() => {
                            if (! this.loggedIn) {
                                this.allowLoginDialog = true;
                                localStorage.removeItem('token');
                            }
                        }, 5000);
                    }
                } else {
                    this.allowLoginDialog = true;
                }

                this.socket.firstConnect = false;
            });

        },

        async findOneUser() {
            console.log('findOneUser')
            socket.emit('findOneUser', {username: "11"}, (res: any) => {
                console.log('findOneUser res', res)
            }, (e: any) => {
                console.log('e', e)
            })
        },

        /**
         * Send request to log user in
         * @param {string} username Username to log in with
         * @param {string} password Password to log in with
         */
        async loginByUsername(username: string, password: string) {
            socket.emit("login", {
                username,
                password
            }, (res: any) => {
                console.log('callback', res)
                if (res.tokenRequired) {
                    return res;
                }



                if (res.ok) {
                    localStorage.setItem('token', res.token);
                    this.socket.token = res.token;
                    this.loggedIn = true;
                    this.username = this.getJWTPayload()?.username;


                    // Trigger Chrome Save Password
                    //history.pushState({}, "");
                }

                return res;
            });
        },

        /**
         * Get payload of JWT cookie
         * @returns {(Object|undefined)}
         */
        getJWTPayload() : any | undefined {
            const jwtToken = localStorage.token;

            if (jwtToken && jwtToken !== "autoLogin") {
                return jwtDecode(jwtToken);
            }
            return undefined;
        },

        /**
         * Log in using a token
         * @param {string} token Token to log in with
         */
        loginByToken(token: string) {
            socket.emit("loginByToken", token, (res: any) => {
                this.allowLoginDialog = true;

                if (!res.ok) {
                    this.logout();
                } else {
                    this.loggedIn = true;
                    this.username = this.getJWTPayload()?.username;
                }
            });
        },

        /** Log out of the web application */
        logout() {
            localStorage.removeItem("token");
            this.socket.token = null;
            this.loggedIn = false;
            this.username = "";
        }


    }
})