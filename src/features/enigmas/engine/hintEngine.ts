import type { EnigmaDefinition, PersistedEnigmaState } from '../../../types'
import type { HintAccessResult } from './enigmaTypes'

export function getNextHint(definition:EnigmaDefinition,state:PersistedEnigmaState):HintAccessResult{
 const hint=definition.hintPolicy.hints.find(item=>!state.hintsUnlocked.includes(item.id))
 if(!hint)return{allowed:false,reason:definition.hintPolicy.hints.length?'ALL_UNLOCKED':'NO_HINTS'}
 if((hint.unlockAfterAttempts??0)>state.attempts)return{allowed:false,reason:'ANALYSIS_REQUIRED'}
 return{allowed:true,hintId:hint.id,textRef:hint.textRef}
}
