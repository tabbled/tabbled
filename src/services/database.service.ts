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
    private _account_id = null;
    get accountId() {
        return this._account_id;
    }

    async open(account: any) {
        if (!account || !account.id) {
            throw Error('Account does not provided')
        }
        this._account_id = account.id

        if (this.database)
            await this.close()

        this.database = AceBase.WithIndexedDB(`tabbled-${account.id}`,{
            multipleTabs: true,
            sponsor: true,
            logLevel: process.env.NODE_ENV === 'development' ? "warn" : "error" });

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


        if (!socketClient.socket.connected) {
            console.warn('Sync database, connection to server is not active')
            return;
        }
        console.log("Sync database, forced = ", force);


        let syncData: object[] = await this.getData(type, !force)
        let rev = await this.getLastRevision();

        let data:DataItemInterface[] = await socketClient.emit('data/sync', {
            type: type,
            data: syncData,
            lastRevision: rev.toString()
        })

        for (let i in data) {
            let item = data[i]
            if (BigInt(item.rev) > rev) rev = BigInt(item.rev);
            await this.database.ref( `${type}/${item.alias}/${item.id}`).update(item)
        }
        await this.setLastRevision(rev)
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

    async getLastRevision():Promise<BigInt> {
        let snapshot = await this.database.ref('/lastRevision')
            .get()

        let rev = snapshot.val()

        return rev ? BigInt(rev) : BigInt(0)
    }

    async setLastRevision(val:BigInt):Promise<void> {
        await this.database.ref('/').update({
            lastRevision: val.toString()
        })
    }
}

const db = ref<Database>(new Database())

export function useDatabase(): UnwrapRef<Database> {
    return db.value;
}