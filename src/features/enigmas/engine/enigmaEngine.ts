import type { EnigmaDefinition, PersistedNarrativeState } from '../../../types'
import type { EnigmaValidator, ValidationResult } from './enigmaTypes'
import { applyUnlockEffects } from './unlockEngine'

export function activateEnigma(state:PersistedNarrativeState,id:string){const item=state.enigmas[id];if(!item||item.status==='locked'||item.status==='solved')return state;return{...state,enigmas:{...state.enigmas,[id]:{...item,status:'active' as const}}}}
export async function attemptEnigma(definition:EnigmaDefinition,answer:string,state:PersistedNarrativeState,validator:EnigmaValidator,development=import.meta.env.DEV):Promise<{state:PersistedNarrativeState;result:ValidationResult}>{
 const current=state.enigmas[definition.id]
 const result=await validator.validate(definition.id,answer,{definition,state,development})
 if(!current)return{state,result:{correct:false,feedbackCode:'VALIDATOR_UNAVAILABLE'}}
 const attempted:PersistedNarrativeState={...state,enigmas:{...state.enigmas,[definition.id]:{...current,status:current.status==='solved'?'solved':'active',attempts:current.attempts+1}}}
 if(!result.correct)return{state:attempted,result}
 const solvedAt=new Date().toISOString()
 const solved:PersistedNarrativeState={...attempted,enigmas:{...attempted.enigmas,[definition.id]:{...attempted.enigmas[definition.id],status:'solved',progress:100,solvedAt}}}
 return{state:applyUnlockEffects(solved,result.unlockEffects),result}
}
