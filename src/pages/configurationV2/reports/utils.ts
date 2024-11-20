import {b64toBlob} from "../../../utils/base64ArrayBuffer.js";
import {ElMessage} from "element-plus";
import {ReportDto} from "./report.dto";
import {useApiClient} from "../../../services/api.service";

export function prepareHtml(html) : string {
    let matches = html.matchAll(/<table[^>]*dataset="([^"]*)"/gm)

    let datasets = []
    for (const match of matches) {
        datasets.push(match[1])
    }

    let start = html.matchAll(/(<\/th><\/tr>)(<tr><td)/gm)

    let idx = 0
    let compensation = 0
    for (const st of start) {
        let add = `{{#each ${datasets[idx]}.items}}`
        html = html.slice(0, st.index+st[1].length + compensation)
            + add + html.slice(st.index+st[1].length + compensation);
        compensation += add.length
        idx++
    }

    compensation = 0
    let end = html.matchAll(/(<\/td><\/tr>)(<\/tbody>)/gm)
    for (const st of end) {
        let add = `{{/each}}`

        html = html.slice(0, st.index + st[1].length + compensation)
            + add + html.slice(st.index + st[1].length + compensation);
        compensation += add.length
    }

    return html
}


export async function preview(report: ReportDto, params: any) {
    console.log('Preview Report')
    let api = useApiClient()

    let repReq = Object.assign({}, report)
    repReq.html = prepareHtml(report.html)

    try {
        let res = await api.post(`v2/reports/preview`, {
            report: repReq,
            params: params
        })
        let rep = res.data

        const objectUrl = window.URL.createObjectURL(new Blob([b64toBlob(rep.report)], {type: `${rep.contentType}`}));

        if (rep.contentType === 'application/pdf') {
            window.open(objectUrl)
        } else {
            let a = document.createElement("a");
            document.body.appendChild(a);
            a.setAttribute('style',"display: none")
            a.href = objectUrl
            a.download = rep.filename
            a.click()
            URL.revokeObjectURL(objectUrl)
        }
    } catch (e) {
        ElMessage.error(e.toString())
        console.error(e)
    }
}