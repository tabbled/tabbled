import { AceBase } from 'acebase';
import {ref, UnwrapRef} from "vue";

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
        console.log("AceBase is reade to use");
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