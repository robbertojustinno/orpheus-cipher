import type { EnigmaDefinition, PersistedNarrativeState } from '../../../types'

export function prerequisitesSatisfied(definition:EnigmaDefinition,state:PersistedNarrativeState){return(definition.prerequisiteIds??[]).every(id=>state.enigmas[id]?.status==='solved')}
export function calculateOverallProgress(definitions:EnigmaDefinition[],state:PersistedNarrativeState){
 const total=definitions.reduce((sum,item)=>sum+(item.progressWeight??1),0)
 if(!total)return 0
 const earned=definitions.reduce((sum,item)=>sum+(item.progressWeight??1)*(state.enigmas[item.id]?.progress??0)/100,0)
 return Math.round(earned/total*100)
}
