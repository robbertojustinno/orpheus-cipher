import { useCallback, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react'
import type { AuditEventType, Enigma, NarrativeProgress, TerminalLog } from '../../types'
import { autocompleteCommand, executeCommand } from './commandExecutor'
import { findCommand } from './commandRegistry'
import { parseCommand } from './commandParser'
import { appendHistory, historyAt } from './terminalHistory'
import type { TerminalAction } from './commandTypes'
import { playSoundCue } from '../../services/soundService'

const clock=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
const entry=(message:string,kind:TerminalLog['kind']='output',type:TerminalLog['type']='info'):TerminalLog=>({id:crypto.randomUUID(),timestamp:clock(),source:kind==='command'?'CIPHER':'ORPHEUS',type,message,kind})
const pause=(milliseconds:number)=>new Promise(resolve=>window.setTimeout(resolve,milliseconds))

interface Options{
 progress:NarrativeProgress
 enigmas:Enigma[]
 setLogs:Dispatch<SetStateAction<TerminalLog[]>>
 onAction:(action:TerminalAction)=>void
 onAudit:(type:AuditEventType,resource?:string)=>void
}

export function useTerminalController({progress,enigmas,setLogs,onAction,onAudit}:Options){
 const[input,setInput]=useState('')
 const[history,setHistory]=useState<string[]>([])
 const[historyIndex,setHistoryIndex]=useState(-1)
 const[busy,setBusy]=useState(false)

 const submit=useCallback(async()=>{
  const raw=input.trim();if(!raw||busy)return
  playSoundCue('terminal')
  const nextHistory=appendHistory(history,raw)
  setHistory(nextHistory);setHistoryIndex(-1);setInput('');setBusy(true)
  setLogs(current=>[...current,entry(raw,'command','cipher')])
  const parsed=parseCommand(raw);const registered=findCommand(parsed.command)
  onAudit('COMMAND_EXECUTED',registered?.name??'unrecognized')
  const result=executeCommand(raw,{progress,enigmas,history:nextHistory})
  if(result.tone==='danger'||result.tone==='warning')playSoundCue('alert')
  const pendingText=result.pendingText
  if(pendingText){setLogs(current=>[...current,entry(pendingText,'output','system')]);await pause(Math.min(900,Math.max(150,result.delayMs??150)))}
  const clears=result.actions?.some(action=>action.type==='clear')
  if(clears)setLogs([])
  else if(result.output)setLogs(current=>[...current,entry(result.output,'output',result.tone??'info')])
  result.actions?.filter(action=>action.type!=='clear').forEach(action=>onAction(action))
  setBusy(false)
 },[input,busy,history,setLogs,progress,enigmas,onAction,onAudit])

 const onKeyDown=useCallback((event:KeyboardEvent<HTMLInputElement>)=>{
  if(event.key==='Enter'){event.preventDefault();void submit();return}
  if(event.key==='ArrowUp'){event.preventDefault();if(!history.length)return;const next=historyIndex<0?history.length-1:Math.max(0,historyIndex-1);setHistoryIndex(next);setInput(historyAt(history,next));return}
  if(event.key==='ArrowDown'){event.preventDefault();if(historyIndex<0)return;const next=historyIndex+1;if(next>=history.length){setHistoryIndex(-1);setInput('')}else{setHistoryIndex(next);setInput(historyAt(history,next))}return}
  if(event.key==='Tab'){event.preventDefault();const completion=autocompleteCommand(input);if(completion.value!==input)setInput(completion.value);else if(completion.suggestions.length>1)setLogs(current=>[...current,entry(completion.suggestions.join('    '),'output','system')])}
 },[history,historyIndex,input,setLogs,submit])

 return{input,setInput,busy,submit,onKeyDown,history}
}
