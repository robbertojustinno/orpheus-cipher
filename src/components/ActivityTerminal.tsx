import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import type { AuditEventType, Enigma, NarrativeProgress, TerminalLog } from '../types'
import type { TerminalAction } from '../features/terminal/commandTypes'
import { useTerminalController } from '../features/terminal/useTerminalController'
import { Icon } from './Icon'
import styles from './ActivityTerminal.module.css'

interface Props{logs:TerminalLog[];setLogs:Dispatch<SetStateAction<TerminalLog[]>>;progress:NarrativeProgress;enigmas:Enigma[];onAction:(action:TerminalAction)=>void;onAudit:(type:AuditEventType,resource?:string)=>void}

export function ActivityTerminal({logs,setLogs,progress,enigmas,onAction,onAudit}:Props){
 const inputRef=useRef<HTMLInputElement>(null);const scrollRef=useRef<HTMLDivElement>(null)
 const controller=useTerminalController({progress,enigmas,setLogs,onAction,onAudit})
 useEffect(()=>{scrollRef.current?.scrollTo({top:scrollRef.current.scrollHeight,behavior:'smooth'})},[logs])
 const prompt=`ORPHEUS://CIPHER/${progress.operator.username.toUpperCase()} >`
 return <section className={styles.terminal} onClick={()=>inputRef.current?.focus()}>
  <header><div><i/><h2>TERMINAL DE ATIVIDADE</h2><small>LIVE STREAM</small></div><button onClick={event=>{event.stopPropagation();setLogs([])}}><Icon name="trash" size={13}/> LIMPAR</button></header>
  <div className={styles.logs} ref={scrollRef}>
   {logs.length===0?<p>// BUFFER LIMPO — AGUARDANDO NOVOS EVENTOS</p>:logs.map(log=>log.kind==='command'?<div key={log.id} className={styles.commandLine}><b>{prompt}</b><span>{log.message}</span></div>:log.kind==='output'?<div key={log.id} className={`${styles.output} ${styles[log.type]}`}><span>{log.message}</span></div>:<div key={log.id} className={styles[log.type]}><time>[{log.timestamp}]</time><strong className={styles[log.source.toLowerCase()]}>[{log.source}]</strong><span>{log.message}</span></div>)}
   <label className={styles.prompt}><b>{prompt}</b><input ref={inputRef} value={controller.input} onChange={event=>controller.setInput(event.target.value)} onKeyDown={controller.onKeyDown} disabled={controller.busy} spellCheck={false} autoComplete="off" aria-label="Comando ORPHEUS"/><i/></label>
  </div>
 </section>
}
