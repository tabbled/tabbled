import { AceBase } from 'acebase';


export class Database {
    constructor() {
        this.database = AceBase.WithIndexedDB('tabbled',{
            //multipleTabs: true,
            logLevel: process.env.NODE_ENV === 'development' ? "verbose" : "error" });
        this.database.ready().then(() => {
            console.log("AceBase is reade to use")
        })
    }

    readonly database: AceBase
}

const db = new Database()

export function useDatabase(): AceBase {
    return db.database;
}