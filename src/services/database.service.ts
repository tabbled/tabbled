import {Connection, DATA_TYPE, IDataBase} from "jsstore"

const configDb: IDataBase = {
    name: "config",
    tables: [{
        name: "pages",
        columns: {
            _id: { primaryKey: true, autoIncrement: false},
            _is_deleted: { dataType: DATA_TYPE.Number },
            _deleted_at: { dataType: DATA_TYPE.DateTime },
            _updated_at: { dataType: DATA_TYPE.DateTime  },
            _version: { dataType: DATA_TYPE.Number }
        }
    }]
}

export class Database {
    constructor() {
        this.connection = new Connection(new Worker(this.getWorkerPath()));
        this.connection.initDb(configDb).then(created => {
            console.log(created ? 'IndexedDB created & connection is opened' : 'IndexedDB connection opened');
        }).catch(e => {
            console.error(e)
        })
    }
    connection: Connection

    private getWorkerPath() {
        if (process.env.NODE_ENV === 'development') {
            return "./../../node_modules/jsstore/dist/jsstore.worker.js";
        } else {
            return "./../../node_modules/jsstore/dist/jsstore.worker.min.js";
        }
    };


}

const db = new Database()

export function useDatabase(): Database {
    return db;
}