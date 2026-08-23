import type{Evidence,SourceQuality}from'../types/investigation'
const quality:Record<SourceQuality,number>={authoritative:12,'public-index':5,secondary:0,unknown:-5}
export function scoreEvidence(items:Evidence[]){return Math.max(0,Math.min(100,items.reduce((score,item)=>score+item.weight+quality[item.quality]+(item.contradictory?-Math.abs(item.weight)*2:0),10)))}
export function explainEvidence(items:Evidence[]){return items.map(item=>`${item.contradictory?'CONTRADICTION':'SIGNAL'}: ${item.description}`).join('\n')||'No supporting evidence.'}
