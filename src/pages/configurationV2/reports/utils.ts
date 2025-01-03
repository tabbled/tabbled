import {b64toBlob} from "../../../utils/base64ArrayBuffer.js";
import {ElMessage} from "element-plus";
import {ReportDto} from "./report.dto";
import {useApiClient} from "../../../services/api.service";

export async function preview(report: ReportDto, params: any) {
    console.log('Preview Report')
    let api = useApiClient()

    let repReq = Object.assign({}, report)

    try {
        let res = await api.post(`v2/reports/preview`, {
            report: repReq,
            params: params
        })
        let rep = res.data
        saveReport(rep)
    } catch (e) {
        ElMessage.error(e.response.data ? e.response.data.error : e.toString())
        console.error(e)
    }
}

export async function render(id, params, output: string, context) {
    let api = useApiClient()

    try {
        let res = await api.post(`v2/reports/${id}/render`, {
            params: params,
            context: context,
            output: output
        })
        let rep = res.data
        saveReport(rep)
    } catch (e) {
        ElMessage.error(e.response.data ? e.response.data.error : e.toString())
        console.error(e)
    }
}

function saveReport(report) {
    const objectUrl = window.URL.createObjectURL(new Blob([b64toBlob(report.report)], {type: `${report.contentType}`}));

    if (report.contentType === 'application/pdf') {
        window.open(objectUrl)
    } else {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute('style',"display: none")
        a.href = objectUrl
        a.download = report.filename
        a.click()
        URL.revokeObjectURL(objectUrl)
    }
}