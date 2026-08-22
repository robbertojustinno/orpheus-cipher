import type{SearchExport,SearchSession}from'../types/osint'
const safe=(session:SearchSession):SearchExport=>({query:session.query,createdAt:session.createdAt,results:session.results})
export const exportSessionJson=(session:SearchSession)=>JSON.stringify(safe(session),null,2)
const csv=(value:unknown)=>`"${String(value??'').replace(/"/g,'""')}"`
export function exportSessionCsv(session:SearchSession){return['source,type,title,url,snippet,confidence',...session.results.map(result=>[result.source,result.resultType,result.title,result.url,result.snippet??'',result.confidence??''].map(csv).join(','))].join('\r\n')}
