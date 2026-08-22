import type { PersistedNarrativeState, UnlockEffect } from '../../../types'

const unique=(items:string[],value:string)=>items.includes(value)?items:[...items,value]
export function applyUnlockEffects(state:PersistedNarrativeState,effects:UnlockEffect[]=[]):PersistedNarrativeState{
 return effects.reduce((next,effect)=>{
  if(effect.type==='ENIGMA'){const current=next.enigmas[effect.targetId];return current?{...next,enigmas:{...next.enigmas,[effect.targetId]:{...current,status:current.status==='solved'?'solved':'available'}}}:next}
  if(effect.type==='FILE')return{...next,unlockedFiles:unique(next.unlockedFiles,effect.targetId)}
  if(effect.type==='MESSAGE')return{...next,unlockedMessages:unique(next.unlockedMessages,effect.targetId)}
  if(effect.type==='DOSSIER')return{...next,unlockedDossiers:unique(next.unlockedDossiers,effect.targetId)}
  if(effect.type==='MAP_NODE')return{...next,unlockedMapNodes:unique(next.unlockedMapNodes,effect.targetId)}
  if(effect.type==='COMMAND')return{...next,discoveredCommands:unique(next.discoveredCommands,effect.targetId)}
  if(effect.type==='MISSION')return{...next,currentMissionId:effect.targetId}
  return next
 },state)
}
