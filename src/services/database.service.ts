import { AceBase } from 'acebase';
import {ref, UnwrapRef} from "vue";
import {useSocketClient} from "./socketio.service";

const socketClient = useSocketClient();

export interface DataItemInterface {
    id: number
    rev: number
    ver: number
    alias: string
    data: {
        [key: string]: any
    }
    createdAt: Date
    updatedAt: Date
    deletedAt?: Date | null | undefined
    createdBy: number
    updatedBy: number
    deletedBy?: number | null | undefined
}

export class Database {
    database: AceBase | undefined

    async open(account: any) {
        if (!account || !account.id) {
            throw Error('Account does not provided')
        }

        if (this.database)
            await this.close()

        this.database = AceBase.WithIndexedDB(`tabbled-${account.id}`,{
            multipleTabs: true,
            logLevel: process.env.NODE_ENV === 'development' ? "verbose" : "error" });

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

    async syncConfig() {
        console.log("sync database")

        if (!this.database) {
            return;
        }

        let data:DataItemInterface[] = await socketClient.emit('data/getMany', {type: 'config', filter: ""})

        for (let i in data) {
            let item = data[i]
            console.log(item)
            await this.database.ref( `config/${item.alias}/${item.id}`).update(item)
        }
    }

}

const db = ref<Database>(new Database())

export function useDatabase(): UnwrapRef<Database> {
    return db.value;
}