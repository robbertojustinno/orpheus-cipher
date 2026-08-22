import { useCallback, useEffect, useRef, useState } from 'react'
import { enigmaDefinitions } from '../data/enigmas'
import { getOperatorIdentity } from '../services/operatorIdentity'
import { createInitialPersistedNarrativeState, createNarrativePersistence, logHydration, type NarrativePersistenceAdapter } from '../services/narrativeStorage'
import type { AuditEventType, Enigma, HydrationState, NarrativeProgress, NarrativeState, OperatorIdentity, PersistedNarrativeState, TerminalLog, TerminalLogType, TerminalSource } from '../types'

const fallbackIdentity:OperatorIdentity={username:'OPERADOR',hostname:'HOST-UNKNOWN',platform:'unknown',arch:'unknown'}
const createInitialProgress=():NarrativeProgress=>({...createInitialPersistedNarrativeState(),operator:fallbackIdentity})
const clock=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
const toPersisted=({operator:_,...state}:NarrativeProgress):PersistedNarrativeState=>({...state,lastSessionAt:new Date().toISOString()})

export function useNarrativeStore(){
  const[adapter]=useState<NarrativePersistenceAdapter>(()=>createNarrativePersistence())
  const[hydration,setHydration]=useState<HydrationState>('loading')
  const[progress,setProgressState]=useState<NarrativeProgress>(createInitialProgress)
  const[logs,setLogs]=useState<TerminalLog[]>([])
  const progressRef=useRef(progress)

  const addTerminalLog=useCallback((entry:{source:TerminalSource;type:TerminalLogType;message:string})=>setLogs(current=>[...current,{...entry,id:crypto.randomUUID(),timestamp:clock()}]),[])

  useEffect(()=>{
    let active=true
    const hydrate=async()=>{
      let persisted:PersistedNarrativeState|null=null
      let persistenceFailed=false
      try{persisted=await adapter.load()}catch(error){persistenceFailed=true;if(import.meta.env.DEV)console.error('[PERSISTENCE] Load failed',error)}
      const operator=await getOperatorIdentity()
      if(!active)return
      const next:NarrativeProgress={...(persisted??createInitialPersistedNarrativeState()),operator}
      progressRef.current=next
      setProgressState(next)
      setLogs([{id:crypto.randomUUID(),timestamp:clock(),source:'ORPHEUS',type:persisted?.firstDetectionCompleted?'success':'info',message:persisted?.missionStarted?`Sessão restaurada. Operador ${operator.username} conectado.`:'Sessão iniciada'}])
      logHydration(persisted)
      setHydration(persistenceFailed?'error':'ready')
    }
    void hydrate()
    return()=>{active=false}
  },[adapter])

  const commit=useCallback(async(next:NarrativeProgress)=>{
    progressRef.current=next
    setProgressState(next)
    try{await adapter.save(toPersisted(next));return true}catch(error){if(import.meta.env.DEV)console.error('[PERSISTENCE] Save failed',error);return false}
  },[adapter])

  const setNarrativeState=useCallback(async(state:NarrativeState)=>{
    const current=progressRef.current
    await commit({...current,narrativeState:state,firstDetectionCompleted:current.firstDetectionCompleted||state==='DETECTED'||state==='MISSION_ACTIVE'})
  },[commit])

  const startMission=useCallback(async()=>{
    const current=progressRef.current
    const next:NarrativeProgress={...current,narrativeState:'MISSION_ACTIVE',firstDetectionCompleted:true,missionStarted:true,enigmas:{...current.enigmas,'box-01':{status:current.enigmas['box-01']?.status==='solved'?'solved':'available',progress:current.enigmas['box-01']?.progress??0}}}
    const saved=await commit(next)
    addTerminalLog(saved?{source:'ORPHEUS',type:'success',message:'Sequência iniciada. Caixa Enigma 01 liberada.'}:{source:'WARNING',type:'danger',message:'Falha ao confirmar persistência da sequência.'})
  },[addTerminalLog,commit])

  const solveEnigma=useCallback(async(id:string)=>{
    const current=progressRef.current
    const nextDefinition=enigmaDefinitions.find(enigma=>enigma.requiresPrevious===id)
    const next:NarrativeProgress={...current,enigmas:{...current.enigmas,[id]:{status:'solved',progress:100},...(nextDefinition?{[nextDefinition.id]:{status:'available',progress:0}}:{})}}
    const saved=await commit(next)
    if(saved)addTerminalLog({source:'ORPHEUS',type:'success',message:'Caixa resolvida. Próxima dependência narrativa verificada.'})
  },[addTerminalLog,commit])

  const resetNarrative=useCallback(async()=>{await adapter.reset()},[adapter])
  const recordAudit=useCallback(async(type:AuditEventType,resource?:string)=>{const current=progressRef.current;const event={id:crypto.randomUUID(),type,timestamp:new Date().toISOString(),...(resource?{resource}:{})};await commit({...current,auditEvents:[...current.auditEvents,event].slice(-200)})},[commit])
  const discoverSecretCommand=useCallback(async(id:string)=>{const current=progressRef.current;if(current.discoveredCommands.includes(id))return;await commit({...current,discoveredCommands:[...current.discoveredCommands,id],auditEvents:[...current.auditEvents,{id:crypto.randomUUID(),type:'SECRET_COMMAND_DISCOVERED' as const,timestamp:new Date().toISOString(),resource:id}].slice(-200)})},[commit])
  const enigmas:Enigma[]=enigmaDefinitions.map(enigma=>({...enigma,status:progress.enigmas[enigma.id]?.status??'locked',progress:progress.enigmas[enigma.id]?.progress??0}))
  return{hydration,progress,logs,enigmas,setLogs,addTerminalLog,setNarrativeState,startMission,solveEnigma,resetNarrative,recordAudit,discoverSecretCommand}
}
