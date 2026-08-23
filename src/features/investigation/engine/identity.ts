export function normalizeEntityValue(value:string){return value.normalize('NFKC').trim().replace(/\s+/g,' ').replace(/[.,;:]+$/,'').toLowerCase()}
export function stableId(prefix:string,...parts:string[]){let hash=2166136261;for(const char of parts.join('|')){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return`${prefix}-${(hash>>>0).toString(36)}`}
export function confidenceFromScore(score:number):'low'|'medium'|'high'{return score>=70?'high':score>=40?'medium':'low'}
