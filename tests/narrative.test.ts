import { describe, expect, it } from 'vitest'
import { formatFounderAccess, SYSTEM_CONFIG } from '../src/config/system'
import { enigmaDefinitions } from '../src/data/enigmas'
import { shouldRunDetection } from '../src/features/narrative/DetectionSequence'
import { createInitialPersistedNarrativeState, WebNarrativePersistence } from '../src/services/narrativeStorage'

class MemoryStorage { private values=new Map<string,string>();getItem(key:string){return this.values.get(key)??null}setItem(key:string,value:string){this.values.set(key,value)}removeItem(key:string){this.values.delete(key)} }

describe('configuração narrativa',()=>{
 it('formata Founder Access sem hardcode visual',()=>expect(formatFounderAccess(1,30)).toBe('01/30'))
 it('mantém a janela de detecção entre 12 e 25 segundos',()=>{expect(SYSTEM_CONFIG.detectionDelay.min).toBe(12000);expect(SYSTEM_CONFIG.detectionDelay.max).toBe(25000)})
 it('mantém dependências progressivas das caixas',()=>{expect(enigmaDefinitions[0].requiresPrevious).toBeUndefined();expect(enigmaDefinitions[1].requiresPrevious).toBe('box-01');expect(enigmaDefinitions[2].requiresBookKnowledge).toBe(true)})
})

describe('persistência narrativa',()=>{
 it('A: começa em INITIAL quando não existe save',async()=>{const adapter=new WebNarrativePersistence(new MemoryStorage());expect(await adapter.load()).toBeNull();expect(createInitialPersistedNarrativeState().narrativeState).toBe('INITIAL')})
 it('B: restaura MISSION_ACTIVE em uma nova instância',async()=>{const storage=new MemoryStorage();const first=new WebNarrativePersistence(storage);const state=createInitialPersistedNarrativeState();state.narrativeState='MISSION_ACTIVE';state.firstDetectionCompleted=true;state.missionStarted=true;await first.save(state);const second=new WebNarrativePersistence(storage);expect((await second.load())?.narrativeState).toBe('MISSION_ACTIVE')})
 it('C: restaura box-01 como available',async()=>{const storage=new MemoryStorage();const first=new WebNarrativePersistence(storage);const state=createInitialPersistedNarrativeState();state.enigmas['box-01']={status:'available',progress:0};await first.save(state);const second=new WebNarrativePersistence(storage);expect((await second.load())?.enigmas['box-01'].status).toBe('available')})
 it('D: não reinicia detecção após a primeira conclusão',()=>{expect(shouldRunDetection('MISSION_ACTIVE',true)).toBe(false);expect(shouldRunDetection('INITIAL',true)).toBe(false)})
 it('E: reset retorna integralmente ao estado inicial',async()=>{const storage=new MemoryStorage();const adapter=new WebNarrativePersistence(storage);const state=createInitialPersistedNarrativeState();state.narrativeState='MISSION_ACTIVE';state.firstDetectionCompleted=true;state.missionStarted=true;state.enigmas['box-01']={status:'available',progress:0};await adapter.save(state);await adapter.reset();expect(await adapter.load()).toBeNull();expect(createInitialPersistedNarrativeState()).toMatchObject({narrativeState:'INITIAL',firstDetectionCompleted:false,missionStarted:false,enigmas:{'box-01':{status:'locked',progress:0}}})})
})
