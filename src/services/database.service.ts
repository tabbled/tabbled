import { AceBase } from 'acebase';
import {ref, UnwrapRef} from "vue";
import {useSocketClient} from "./socketio.service";
import {EventEmitter} from "events";

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

export class Database extends EventEmitter {
    constructor() {
        super();
    }
    database: AceBase | undefined
    private _account_id = null;

    get accountId() {
        return this._account_id;
    }

    async open(account: any) {
        if (!account || !account.id) {
            throw Error('Account does not provided')
        }

        if (this.accountId) {
            socketClient.socket.off(`${this.accountId}/data/changed`)
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

        await this.sync('config')
        await this.getChangesFromServer('config')

        socketClient.socket.on(`${this.accountId}/data/changed`, (data => {
            this.getChangesFromServer(data.type)
        }))
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
        console.log("Sync database, forced =", force);


        let syncData: object[] = await this.getNotSyncedData(type, !force)
        await socketClient.emit('data/sync', {
            type: type,
            data: syncData
        })

        await this.getChangesFromServer(type);
    }

    async getChangesFromServer(type: ItemType) {
        console.log('getChangesFromServer, type =', type)
        let rev = await this.getLastRevision();

        try {
            let data:Array<DataItemInterface> = await socketClient.emit('data/changes', {
                type: type,
                lastRevision: rev.toString()
            })

            console.log(`Got changes from server, ${data.length} items`)
            let ids = []
            for (let i in data) {
                let item = data[i]
                ids.push(item.id)

                if (BigInt(item.rev) > rev)
                    rev = BigInt(item.rev);

                let ref = this.database.ref( `${type}/${item.alias}/${item.id}`)
                let exists = await ref.get()
                console.log('exists', exists.val())
                await ref.update(item)
                if (exists.exists()) {
                    this.emit(`/${type}/${item.alias}/changed`, [item.id])
                } else {
                    this.emit(`/${type}/${item.alias}/inserted`, [item.id])
                }

                //this.emit(`/${type}/${item.alias}/changed`, [item.id])
            }

            if (data.length > 0) {
                this.emit(`/${type}/changed`, ids)
            }


            await this.setLastRevision(rev)
        } catch (e) {
            console.error(e)
        }
    }

    async getNotSyncedData(type: ItemType, onlyChanges: boolean = true) : Promise<object[]> {
        if (!this.database) {
            console.error("getConfigData, database is not opened");
            return [];
        }

        let aliases = this.getAliasesByType(type)
        let items: Array<DataItemInterface> = []
        for(let i in aliases) {
            let alias = aliases[i]
            let iter = this.database.query(`${type}/${alias}`);

            if (onlyChanges) {
                iter = iter.filter('rev', '==', '')
            }

            await iter.forEach(item => {
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