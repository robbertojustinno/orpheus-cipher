export const SYSTEM_CONFIG={founderId:1,founderTotal:30,detectionDelay:{min:12_000,max:25_000},storageKey:'orpheus.narrative.v1'} as const
export const formatFounderAccess=(id:number,total:number)=>`${String(id).padStart(2,'0')}/${String(total).padStart(2,'0')}`
