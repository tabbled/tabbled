import {defineComponent} from "vue";
import {useStore} from "vuex"

export default defineComponent ( {
    data() {
        return {
            store: useStore(),
            socket: {
                connected: false,
                connectCount: 0,
                initedSocketIO: false
            },
            connectionErrorMsg: "Cannot connect to the socket server. Reconnecting...",
        }
    },

    created() {
        this.initSocketIO();
    },

    methods: {
        /**
         * Subscribe on socket server events
         * @returns {(void|null)}
         */
        initSocketIO() {
            //No need to re-subscribe
            if (this.socket.initedSocketIO) {
                return;
            }
            this.socket.initedSocketIO = true;


            this.$socket.on("exception", (err) => {
                console.error(err);
            });

            this.$socket.on("connect_error", (err) => {
                console.error(`!!!Failed to connect to the backend. Socket.io connect_error: ${err.message}`);
                this.connectionErrorMsg = `Cannot connect to the socket server. [${err}] Reconnecting...`;
                this.socket.connected = false;
            });

            this.$socket.on("disconnect", () => {
                this.$root?.$notify({
                    title: 'Disconnected',
                    message: "Lost connection to the server",
                    showClose: true,
                    type: 'warning',
                })
            });

            //When the server decided that token is not valid or expired
            this.$socket.on("login_needed", () => {
                this.$router.push('/login');
            })

            this.$socket.on("connect", () => {
                console.log("Connected to the socket server");
                this.socket.connectCount++;

                if (!this.socket.connected)
                    this.$root?.$notify({
                        title: 'Connected',
                        message: "Connected to the server",
                        showClose: true,
                        type: 'success',
                    })

                this.socket.connected = true;
            });
        }
    }
})