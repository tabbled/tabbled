import { AceBase } from 'acebase';
import {ref, UnwrapRef} from "vue";
import {useSocketClient} from "./socketio.service";

const socketClient = useSocketClient();

// TODO need to move into plugins
const configAliases = ['page', 'datasource', 'menu']
export type ItemType = 'config' | 'data'

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
            logLevel: process.env.NODE_ENV === 'development' ? "error" : "error" });

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

    /**
     * Sync config or user data with the server
     * @param type  - config or data will be synced with server
     * @param force - if true the all data will be pushed to the server,
     *                if false only changed data will be pushed to the server
     */
    async sync(type: ItemType, force: boolean = false) {
        if (!this.database) {
            console.error("sync database, database is not opened");
            return;
        }
        console.log("sync database, forced = ", force);

        let syncData: object[] = await this.getData(type, !force)

        let data:DataItemInterface[] = await socketClient.emit('data/sync', {
            type: type,
            data: syncData
        })

        for (let i in data) {
            let item = data[i]
            console.log(item)
            await this.database.ref( `${type}/${item.alias}/${item.id}`).update(item)
        }
    }

    async getData(type: ItemType, onlyChanges: boolean = true) : Promise<object[]> {
        if (!this.database) {
            console.error("getConfigData, database is not opened");
            return [];
        }

        let aliases = this.getAliasesByType(type)
        let items: Array<DataItemInterface> = []
        for(let i in aliases) {
            let alias = aliases[i]
            console.log(alias, onlyChanges)
            let itter = this.database.query(`${type}/${alias}`);

            if (onlyChanges) {
                itter = itter.filter('rev', '==', '')
            }

            await itter.forEach(item => {
                items.push(item.val())
            })
        }

        return items;
    }

    getAliasesByType(type: ItemType) {
        if (type === 'config') return configAliases
        else return []
    }
}

const db = ref<Database>(new Database())

export function useDatabase(): UnwrapRef<Database> {
    return db.value;
}