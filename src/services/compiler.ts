import {useDataSourceScriptHelper} from "./datasource.service";
import { FlakeId } from '../flake-id'
import {useFunctionScriptHelper} from "./function.service";
let flakeId = new FlakeId()
import { useSocketClient } from "./socketio.service";

class Utils {
    async generateId() {
        return flakeId.generateId().toString()
    }
}


export class CompiledFunc {
    private dsService = useDataSourceScriptHelper()
    private source: string = ""
    private func: Function | undefined = undefined
    private utils = new Utils()
    private socketClient = useSocketClient()
    private funcService = useFunctionScriptHelper(this.socketClient)



    exec(...args: any[]) {
        if (!this.func)
            return;

        return this.func(this.dsService, this.utils, this.funcService, ...args)
    }

    compile(source: string, ...args: string[]) : boolean  {
        this.source = source;
        this.func = new Function('dataSources', 'utilities', 'functions', ...args,
            ` ${source} `)
        return true
    }
}

export function compileScript(script: string, ...args: string[]) : CompiledFunc {
    let func = new CompiledFunc()
    func.compile(script, ...args)
    return func
}