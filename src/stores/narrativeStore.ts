import { useCallback, useEffect, useRef, useState } from 'react'
import { enigmaDefinitions } from '../data/enigmas'
import { getOperatorIdentity } from '../services/operatorIdentity'
import { createInitialPersistedNarrativeState, createNarrativePersistence, logHydration, type NarrativePersistenceAdapter } from '../services/narrativeStorage'
import type { AuditEventType, Enigma, HydrationState, NarrativeProgress, NarrativeState, OperatorIdentity, PersistedNarrativeState, TerminalLog, TerminalLogType, TerminalSource } from '../types'
import { activateEnigma, attemptEnigma } from '../features/enigmas/engine/enigmaEngine'
import { createEnigmaValidator } from '../features/enigmas/engine/enigmaValidator'
import { getNextHint } from '../features/enigmas/engine/hintEngine'
import { emitNarrativeEvent } from '../features/enigmas/engine/narrativeEvents'
import type { LicenseIdentity } from '../features/license/types/license'

const fallbackIdentity:OperatorIdentity={username:'OPERADOR',hostname:'HOST-UNKNOWN',platform:'unknown',arch:'unknown'}
const createInitialProgress=():NarrativeProgress=>({...createInitialPersistedNarrativeState(),operator:fallbackIdentity})
const clock=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})
const toPersisted=({operator:_,...state}:NarrativeProgress):PersistedNarrativeState=>({...state,lastSessionAt:new Date().toISOString()})

export function useNarrativeStore(license?:LicenseIdentity){
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
      const base=persisted??createInitialPersistedNarrativeState()
      const next:NarrativeProgress={...base,founderId:license?.type==='FOUNDER'&&license.founderNumber?license.founderNumber:base.founderId,operator}
      progressRef.current=next
      setProgressState(next)
      setLogs([{id:crypto.randomUUID(),timestamp:clock(),source:'ORPHEUS',type:persisted?.firstDetectionCompleted?'success':'info',message:persisted?.missionStarted?`Sessão restaurada. Operador ${operator.username} conectado.`:'Sessão iniciada'}])
      logHydration(persisted)
      setHydration(persistenceFailed?'error':'ready')
    }
    void hydrate()
    return()=>{active=false}
  },[adapter,license?.founderNumber,license?.type])

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
    const box=current.enigmas['box-01']
    const founder=license?.type==='FOUNDER'&&license.founderNumber
    const cohort=founder?founder<=10?'a':founder<=20?'b':'c':null
    const next:NarrativeProgress={...current,narrativeState:'MISSION_ACTIVE',firstDetectionCompleted:true,missionStarted:true,campaignStartedAt:current.campaignStartedAt??new Date().toISOString(),unlockedFiles:cohort?[...new Set([...current.unlockedFiles,`founder-fragment-${cohort}`])]:current.unlockedFiles,unlockedBadges:founder?[...new Set([...current.unlockedBadges,'FOUNDING OPERATIVE'])]:current.unlockedBadges,enigmas:{...current.enigmas,'box-01':{...box,status:box?.status==='solved'?'solved':'available',progress:box?.progress??0,attempts:box?.attempts??0,hintsUnlocked:box?.hintsUnlocked??[]}}}
    const saved=await commit(next)
    addTerminalLog(saved?{source:'ORPHEUS',type:'success',message:'Sequência iniciada. Caixa Enigma 01 liberada.'}:{source:'WARNING',type:'danger',message:'Falha ao confirmar persistência da sequência.'})
  },[addTerminalLog,commit,license?.founderNumber,license?.type])

  const openEnigma=useCallback(async(id:string)=>{const current=progressRef.current;const activated=activateEnigma(toPersisted(current),id);const next={...activated,operator:current.operator};await commit(next);emitNarrativeEvent({type:'ENIGMA_OPENED',enigmaId:id})},[commit])
  const submitEnigmaAnswer=useCallback(async(id:string,answer:string)=>{
    const definition=enigmaDefinitions.find(item=>item.id===id);if(!definition)return{correct:false,feedbackCode:'VALIDATOR_UNAVAILABLE' as const}
    const current=progressRef.current
    const outcome=await attemptEnigma(definition,answer,toPersisted(current),createEnigmaValidator())
    const auditType=outcome.result.correct?'ENIGMA_SOLVED' as const:'ENIGMA_ATTEMPTED' as const
    const now=new Date().toISOString();const audit={id:crypto.randomUUID(),type:auditType,timestamp:now,resource:id};const unlockAudits=outcome.result.correct?(outcome.result.unlockEffects??[]).map(effect=>({id:crypto.randomUUID(),type:'UNLOCK_APPLIED' as const,timestamp:now,resource:`${effect.type}:${effect.targetId}`})):[]
    const finalSolved=outcome.result.correct&&id==='box-12'
    await commit({...outcome.state,operator:current.operator,campaignCompleted:outcome.state.campaignCompleted||finalSolved,completionDate:finalSolved?(outcome.state.completionDate??now):outcome.state.completionDate,unlockedBadges:finalSolved?[...new Set([...outcome.state.unlockedBadges,'CIPHER OPERATIVE','ORPHEUS CLEARED'])]:outcome.state.unlockedBadges,auditEvents:[...outcome.state.auditEvents,audit,...unlockAudits].slice(-200)})
    emitNarrativeEvent({type:auditType,enigmaId:id})
    addTerminalLog(outcome.result.correct?{source:'ORPHEUS',type:'success',message:`Enigma ${String(definition.number).padStart(2,'0')} solucionado. Desbloqueios aplicados.`}:{source:'CIPHER',type:'warning',message:'Validação negada. Revise as evidências disponíveis.'})
    if(outcome.result.correct)for(const effect of outcome.result.unlockEffects??[]){emitNarrativeEvent({type:'UNLOCK_APPLIED',enigmaId:id,targetId:effect.targetId});if(effect.type==='FILE')addTerminalLog({source:'ORPHEUS',type:'success',message:'NEW CLASSIFIED FILE RECOVERED'});if(effect.type==='MESSAGE')addTerminalLog({source:'CIPHER',type:'success',message:'NEW MESSAGE RECEIVED'})}
    return outcome.result
  },[addTerminalLog,commit])
  const unlockHint=useCallback(async(id:string)=>{const current=progressRef.current;const definition=enigmaDefinitions.find(item=>item.id===id);const state=current.enigmas[id];if(!definition||!state)return{allowed:false,reason:'NO_HINTS' as const};const access=getNextHint(definition,state);if(!access.allowed||!access.hintId)return access;const event={id:crypto.randomUUID(),type:'HINT_UNLOCKED' as const,timestamp:new Date().toISOString(),resource:`${id}:${access.hintId}`};await commit({...current,enigmas:{...current.enigmas,[id]:{...state,hintsUnlocked:[...state.hintsUnlocked,access.hintId]}},auditEvents:[...current.auditEvents,event].slice(-200)});emitNarrativeEvent({type:'HINT_UNLOCKED',enigmaId:id,targetId:access.hintId});return access},[commit])
  const devSetEnigma=useCallback(async(id:string,action:'unlock'|'lock'|'solve'|'reset'|'attempt'|'hint')=>{if(!import.meta.env.DEV)return;const current=progressRef.current;const state=current.enigmas[id];if(!state)return;let next={...state};if(action==='unlock')next.status='available';if(action==='lock')next.status='locked';if(action==='solve'){next.status='solved';next.progress=100;next.solvedAt=new Date().toISOString()}if(action==='reset')next={status:'available',progress:0,attempts:0,hintsUnlocked:[]};if(action==='attempt'){next.status='active';next.attempts++}if(action==='hint'){const definition=enigmaDefinitions.find(item=>item.id===id);const hint=definition?.hintPolicy.hints.find(item=>!next.hintsUnlocked.includes(item.id));if(hint)next.hintsUnlocked=[...next.hintsUnlocked,hint.id]}await commit({...current,enigmas:{...current.enigmas,[id]:next}})},[commit])

  const resetNarrative=useCallback(async()=>{await adapter.reset()},[adapter])
  const recordAudit=useCallback(async(type:AuditEventType,resource?:string)=>{const current=progressRef.current;const event={id:crypto.randomUUID(),type,timestamp:new Date().toISOString(),...(resource?{resource}:{})};await commit({...current,auditEvents:[...current.auditEvents,event].slice(-200)})},[commit])
  const discoverSecretCommand=useCallback(async(id:string)=>{const current=progressRef.current;if(current.secretDiscoveries.includes(id))return;await commit({...current,secretDiscoveries:[...current.secretDiscoveries,id],discoveredCommands:[...new Set([...current.discoveredCommands,id])],unlockedBadges:[...new Set([...current.unlockedBadges,'CLASSIFIED'])],auditEvents:[...current.auditEvents,{id:crypto.randomUUID(),type:'SECRET_COMMAND_DISCOVERED' as const,timestamp:new Date().toISOString(),resource:id}].slice(-200)})},[commit])
  const enigmas:Enigma[]=enigmaDefinitions.map(enigma=>({...enigma,status:progress.enigmas[enigma.id]?.status??'locked',progress:progress.enigmas[enigma.id]?.progress??0,attempts:progress.enigmas[enigma.id]?.attempts??0,hintsUnlocked:progress.enigmas[enigma.id]?.hintsUnlocked??[],solvedAt:progress.enigmas[enigma.id]?.solvedAt}))
  return{hydration,progress,logs,enigmas,setLogs,addTerminalLog,setNarrativeState,startMission,openEnigma,submitEnigmaAnswer,unlockHint,devSetEnigma,resetNarrative,recordAudit,discoverSecretCommand}
}
