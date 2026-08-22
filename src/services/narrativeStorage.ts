import { load, type Store } from '@tauri-apps/plugin-store'
import { SYSTEM_CONFIG } from '../config/system'
import { enigmaDefinitions } from '../data/enigmas'
import type { EnigmaStatus, NarrativeState, PersistedNarrativeState } from '../types'

const STORE_FILE='orpheus-state.json'
const STORE_KEY='narrative'
const VALID_STATES:NarrativeState[]=['INITIAL','MONITORING','ANOMALY','DETECTED','MISSION_ACTIVE']
const VALID_ENIGMA_STATES:EnigmaStatus[]=['locked','available','active','solved']
const devLog=(message:string)=>{if(import.meta.env.DEV)console.info(`[PERSISTENCE] ${message}`)}

export interface NarrativePersistenceAdapter {
  readonly environment:'TAURI'|'WEB'
  load():Promise<PersistedNarrativeState|null>
  save(state:PersistedNarrativeState):Promise<void>
  reset():Promise<void>
}

interface StorageLike { getItem(key:string):string|null; setItem(key:string,value:string):void; removeItem(key:string):void }

export function createInitialPersistedNarrativeState():PersistedNarrativeState{
  return{version:1,narrativeState:'INITIAL',firstDetectionCompleted:false,missionStarted:false,founderId:SYSTEM_CONFIG.founderId,founderTotal:SYSTEM_CONFIG.founderTotal,enigmas:Object.fromEntries(enigmaDefinitions.map(enigma=>[enigma.id,{status:'locked',progress:0}])),unlockedFiles:[],restoredFragments:[],discoveredCommands:[],auditEvents:[]}
}

/** Normaliza saves antigos e deixa o ponto de extensão pronto para versões futuras. */
export function migrateNarrativeState(value:unknown):PersistedNarrativeState{
  const defaults=createInitialPersistedNarrativeState()
  if(!value||typeof value!=='object')return defaults
  const source=value as Record<string,unknown>
  const legacyStatuses=(source.enigmas??{}) as Record<string,unknown>
  const legacyProgress=(source.enigmaProgress??{}) as Record<string,unknown>
  const migratedEnigmas={...defaults.enigmas}
  for(const definition of enigmaDefinitions){
    const entry=legacyStatuses[definition.id]
    if(entry&&typeof entry==='object'){
      const candidate=entry as{status?:unknown;progress?:unknown}
      migratedEnigmas[definition.id]={status:VALID_ENIGMA_STATES.includes(candidate.status as EnigmaStatus)?candidate.status as EnigmaStatus:'locked',progress:typeof candidate.progress==='number'?candidate.progress:0}
    }else if(VALID_ENIGMA_STATES.includes(entry as EnigmaStatus)){
      migratedEnigmas[definition.id]={status:entry as EnigmaStatus,progress:typeof legacyProgress[definition.id]==='number'?legacyProgress[definition.id] as number:0}
    }
  }
  const narrativeState=VALID_STATES.includes(source.narrativeState as NarrativeState)?source.narrativeState as NarrativeState:'INITIAL'
  return{version:1,narrativeState,firstDetectionCompleted:Boolean(source.firstDetectionCompleted??source.firstExecutionCompleted),missionStarted:Boolean(source.missionStarted??narrativeState==='MISSION_ACTIVE'),founderId:typeof source.founderId==='number'?source.founderId:defaults.founderId,founderTotal:typeof source.founderTotal==='number'?source.founderTotal:defaults.founderTotal,enigmas:migratedEnigmas,unlockedFiles:Array.isArray(source.unlockedFiles)?source.unlockedFiles.filter(item=>typeof item==='string') as string[]:[],restoredFragments:Array.isArray(source.restoredFragments)?source.restoredFragments.filter(item=>typeof item==='string') as string[]:[],discoveredCommands:Array.isArray(source.discoveredCommands)?source.discoveredCommands.filter(item=>typeof item==='string') as string[]:[],auditEvents:Array.isArray(source.auditEvents)?source.auditEvents.filter(item=>item&&typeof item==='object') as PersistedNarrativeState['auditEvents']:[],lastSessionAt:typeof source.lastSessionAt==='string'?source.lastSessionAt:undefined}
}

export class WebNarrativePersistence implements NarrativePersistenceAdapter{
  readonly environment='WEB' as const
  constructor(private readonly storage:StorageLike=localStorage){}
  async load(){const raw=this.storage.getItem(SYSTEM_CONFIG.storageKey);return raw?migrateNarrativeState(JSON.parse(raw)):null}
  async save(state:PersistedNarrativeState){this.storage.setItem(SYSTEM_CONFIG.storageKey,JSON.stringify(state))}
  async reset(){this.storage.removeItem(SYSTEM_CONFIG.storageKey)}
}

class TauriNarrativePersistence implements NarrativePersistenceAdapter{
  readonly environment='TAURI' as const
  private storePromise:Promise<Store>|null=null
  private store(){return this.storePromise??=load(STORE_FILE,{autoSave:false,defaults:{}})}
  async load(){const value=await(await this.store()).get<unknown>(STORE_KEY);return value?migrateNarrativeState(value):null}
  async save(state:PersistedNarrativeState){const store=await this.store();await store.set(STORE_KEY,state);await store.save()}
  async reset(){const store=await this.store();await store.delete(STORE_KEY);await store.save()}
}

export function isTauriEnvironment(){return'__TAURI_INTERNALS__'in window}
export function createNarrativePersistence():NarrativePersistenceAdapter{const adapter=isTauriEnvironment()?new TauriNarrativePersistence():new WebNarrativePersistence();devLog(`Environment: ${adapter.environment}`);return adapter}
export function logHydration(state:PersistedNarrativeState|null){if(!import.meta.env.DEV)return;devLog('Loading state...');devLog(state?'Save found':'No save found');if(state){devLog(`narrativeState = ${state.narrativeState}`);devLog(`box-01 = ${state.enigmas['box-01']?.status??'locked'}`)}devLog('hydration complete')}
