import { invoke } from '@tauri-apps/api/core'
import type { NarrativeProgress } from '../../types'

export interface ExportResult { name:string; mode:'native'|'browser'; path?:string }

function isTauriRuntime(){
 return typeof window!=='undefined'&&'__TAURI_INTERNALS__' in window
}

function browserDownload(name:string,type:string,content:string):ExportResult{
 const url=URL.createObjectURL(new Blob([content],{type}))
 const anchor=document.createElement('a')
 anchor.href=url
 anchor.download=name
 anchor.style.display='none'
 document.body.appendChild(anchor)
 anchor.click()
 anchor.remove()
 window.setTimeout(()=>URL.revokeObjectURL(url),1000)
 return{name,mode:'browser'}
}

async function saveExport(name:string,type:string,content:string):Promise<ExportResult>{
 if(isTauriRuntime()){
  const path=await invoke<string>('save_export_file',{filename:name,content})
  return{name,mode:'native',path}
 }
 return browserDownload(name,type,content)
}

export async function exportOperationReport(progress:NarrativeProgress):Promise<ExportResult>{
 const solved=Object.entries(progress.enigmas).filter(([,state])=>state.status==='solved')
 const attempts=solved.reduce((sum,[,state])=>sum+state.attempts,0)
 const hints=solved.reduce((sum,[,state])=>sum+state.hintsUnlocked.length,0)
 const report={product:'ORPHEUS',version:'1.0',operator:progress.operator.username,founderId:progress.founderId,completedAt:progress.completionDate,mainEnigmasSolved:solved.map(([id])=>id),attempts,hintsUsed:hints,secretDiscoveries:progress.secretDiscoveries.length,badges:progress.unlockedBadges}
 return saveExport('orpheus-operation-report.json','application/json',JSON.stringify(report,null,2))
}

export async function exportShareCard(progress:NarrativeProgress):Promise<ExportResult>{
 const founder=progress.founderId>=1&&progress.founderId<=30?`FOUNDER ${String(progress.founderId).padStart(2,'0')}/30`:'CIPHER ACCESS'
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#020711"/><stop offset="1" stop-color="#092033"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="48" y="48" width="1104" height="534" fill="none" stroke="#31caef" stroke-opacity=".5"/><text x="90" y="135" fill="#58daf8" font-family="monospace" font-size="24" letter-spacing="7">ORPHEUS // OPERATION COMPLETE</text><text x="90" y="285" fill="#f1fbff" font-family="Arial" font-size="72" font-weight="700">CIPHER OPERATIVE</text><text x="90" y="365" fill="#7af2b0" font-family="monospace" font-size="34" letter-spacing="5">${founder}</text><text x="90" y="510" fill="#7892a6" font-family="monospace" font-size="22">MAIN OPERATION 100% // CLASSIFIED ACCESS PRESERVED</text></svg>`
 return saveExport('orpheus-operation-complete.svg','image/svg+xml',svg)
}
