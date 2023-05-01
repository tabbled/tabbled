import {ref, UnwrapRef} from "vue";
import {compileScript} from "./compiler";
import {useDataSourceService} from "./datasource.service";



export class FunctionScriptHelper {
    constructor() {
    }

    async invoke(alias: string, context: any) {
        console.log('invoking function ', alias)

        let dsService = await useDataSourceService()
        let ds = await dsService.getDataSourceByAlias('function')
        let functions = await  ds.getMany( {filter: [{key: 'data/alias', op: "==", compare: alias}]} )

        if (!functions.length) {
            console.error(`No function with alias "${alias}"`)
            return;
        }
        let funcSrc = functions[0]

        let func = await compileScript(funcSrc.script, 'ctx')
        console.log(funcSrc)
        return await func.exec(context)
    }
}

let funcScriptHelper = ref<FunctionScriptHelper>(new FunctionScriptHelper())

export function useFunctionScriptHelper(): UnwrapRef<any> {
    return funcScriptHelper.value
}