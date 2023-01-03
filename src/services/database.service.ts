import Dexie from 'dexie'
import {ref} from "vue";

export class Database extends Dexie {
    constructor() {
        super('tabbled');
    }
}

export class ConfigDatabase extends Dexie {
    [key: string]: any;
    constructor() {
        super('tabbled_config');
        this.version(2).stores({
            pages: '_id, _deletedAt',
            sidebarMenu: '_id',
            dataSources: '_id'
        })
    }
}

const db = new Database()
const config_db = ref<ConfigDatabase> (new ConfigDatabase())

export function useDatabase(): Database {
    return db;
}

export function useConfigDatabase(): ConfigDatabase {
    return config_db.value;
}