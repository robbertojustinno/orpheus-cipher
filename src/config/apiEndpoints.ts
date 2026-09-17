const clean=(value:unknown)=>String(value??'').replace(/\/$/,'')
const developmentDefault=import.meta.env.MODE==='development'?'http://127.0.0.1:47831':''
export const narrativeApiEndpoint=clean(import.meta.env.VITE_ORPHEUS_NARRATIVE_ENDPOINT??developmentDefault)
export const rewardApiEndpoint=clean(import.meta.env.VITE_ORPHEUS_API_ENDPOINT??developmentDefault)
export const trustedApiEndpoint=(value:string)=>value.startsWith('https://')||value.startsWith('http://127.0.0.1:')
