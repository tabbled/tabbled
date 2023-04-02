import {useDataSourceScriptHelper} from "./datasource.service";



export class CompiledFunc {
    private dsService = useDataSourceScriptHelper()
    private source: string = ""
    private func: Function | undefined = undefined

    exec(...args: any[]) {
        if (!this.func)
            return;
        return this.func(this.dsService, ...args)
    }

    compile(source: string, ...args: string[]) : boolean  {
        this.source = source;
        this.func = new Function('dataSources', ...args,
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