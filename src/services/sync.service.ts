import {ref} from "vue";
import {useSocketClient} from "./socketio.service";
import {EventEmitter} from "events";
import {DataSourceInterface, DataSourceType} from "../model/datasource";
import {useDatabase} from "./database.service";

const socketClient = useSocketClient();
const db = useDatabase()

export interface DataItemInterface {
    id: string
    rev: string
    version: number
    alias: string
    accountId: number
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

export class SyncService extends EventEmitter {
    constructor() {
        super();
    }

    dataSources: Map<string, DataSourceInterface>
    setDataSources(ds: Map<string, DataSourceInterface>) {
        this.dataSources = ds;

        socketClient.socket.off(`${db.accountId}/data/changed`)
        socketClient.socket.on(`${db.accountId}/data/changed`, async(data) => {
            console.log('data/changed')
            await this.pull(data.type)
        })
    }

    // Gather the all persisted data in dataSources and push into sync.service
    // Need to implement a persistent storage for sync.service,
    // and this method will be removed
    async sync(type?: DataSourceType) {
        let data = []

        //Gathering not pushed data to the server
        for(const ds of this.dataSources.values()) {
            if (!type || (type && ds.type === type)) {
                data.push(...await ds.getManyRaw([
                    { key: 'rev', op: '==', compare: '' }
                ]))
            }
        }

        if (data.length) {
            await this.push(type, data)
        }
        await this.pull(type);
    }

    async push(type: DataSourceType, data: DataItemInterface[]) {
        if (!socketClient.socket.connected) {
            console.warn('Sync:pushing to remote, connection is not active')
            return;
        }
        try {
            await socketClient.emit('data/sync', {
                type: type,
                data: data
            })
        } catch (e) {
            throw e;
        }
    }

    async pull(type: DataSourceType) {
        let rev = await this.getLastRevision();

        try {
            let data: Array<DataItemInterface> = await socketClient.emit('data/changes', {
                type: type,
                lastRevision: rev.toString()
            })

            if(!data.length)
                return;

            console.log(`Got changes from server, ${data.length} items`)

            for (let i in data) {
                let item = data[i]

                let ds = this.dataSources.get(item.alias)

                if (!ds) {
                    console.log(`DataSource "${item.alias}" doesn't exist`)
                    continue
                }

                let synced = await ds.setRemoteChanges([item])
                if (!synced) {
                    console.warn(`Item ${item.id} not synced by dataSource`)
                    continue
                }
                if (BigInt(item.rev) > rev)
                    rev = BigInt(item.rev);
            }
            await this.setLastRevision(rev)
        } catch (e) {
            throw e
        }
    }

    async getLastRevision():Promise<BigInt> {
        let snapshot = await db.database.ref('/lastRevision')
            .get()

        let rev = snapshot.val()

        return rev ? BigInt(rev) : BigInt(0)
    }

    async setLastRevision(val:BigInt):Promise<void> {
        await db.database.ref('/').update({
            lastRevision: val.toString()
        })
    }
}

const instance = ref<SyncService>(new SyncService());

export function useSyncService() {
    return instance.value
}