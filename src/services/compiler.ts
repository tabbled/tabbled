import {useDataSourceScriptHelper} from "./datasource.service";
import { FlakeId } from '../flake-id'
let flakeId = new FlakeId()

class Utils {
    async generateId() {
        return (await flakeId.generateId()).toString()
    }
}


export class CompiledFunc {
    private dsService = useDataSourceScriptHelper()
    private source: string = ""
    private func: Function | undefined = undefined
    private utils = new Utils()

    exec(...args: any[]) {
        if (!this.func)
            return;
        return this.func(this.dsService, this.utils, ...args)
    }

    compile(source: string, ...args: string[]) : boolean  {
        this.source = source;
        this.func = new Function('dataSources', 'utils', ...args,
            ` ${source} `)
        return true
    }
}

export async function compileScript(script: string, ...args: string[]) : Promise<CompiledFunc> {
    return new Promise(async (resolve, reject) => {
        try {
            let func = new CompiledFunc()
            func.compile(script, ...args)
            resolve(func)
        } catch (e) {
            reject(e)
        }
    })
}