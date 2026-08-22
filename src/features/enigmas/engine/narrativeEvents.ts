import type { EnigmaEvent } from './enigmaTypes'
type Listener=(event:EnigmaEvent)=>void
const listeners=new Set<Listener>()
export const emitNarrativeEvent=(event:Omit<EnigmaEvent,'timestamp'>)=>{const complete={...event,timestamp:new Date().toISOString()};listeners.forEach(listener=>listener(complete));return complete}
export const subscribeNarrativeEvents=(listener:Listener)=>{listeners.add(listener);return()=>listeners.delete(listener)}
