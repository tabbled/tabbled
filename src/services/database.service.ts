import { AceBase } from 'acebase';
import {ref, UnwrapRef} from "vue";
import {useSocketClient} from "./socketio.service";
import {EventEmitter} from "events";

const socketClient = useSocketClient();

export class Database extends EventEmitter {
    constructor() {
        super();
    }
    database: AceBase | undefined
    private _account_id = null;
    private _user_id = null;

    get accountId() {
        return this._account_id;
    }

    get userId() {
        return this._user_id;
    }

    async open(account: any, user: any) {
        if (!account || !account.id) {
            throw Error('Account does not provided')
        }

        if (!user || !user.id) {
            throw Error('User does not provided')
        }
        this._user_id = user.id;

        if (this.accountId) {
            socketClient.socket.off(`${this.accountId}/data/changed`)
        }

        this._account_id = account.id

        if (this.database)
            await this.close()

        this.database = AceBase.WithIndexedDB(`tabbled-${account.id}`,{
            multipleTabs: true,
            sponsor: true,
            logLevel: process.env.NODE_ENV === 'development' ? "warn" : "error"
        });

        await this.database.ready()
        console.log("Database is reade to use");
    }

    async close() {
        if (this.database) {
            await this.database.close();
            delete this.database;
            this.database = undefined;
        }
    }
}

const db = ref<Database>(new Database())

export function useDatabase(): UnwrapRef<Database> {
    return db.value;
}