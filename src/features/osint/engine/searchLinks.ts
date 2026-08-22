import{openUrl}from'@tauri-apps/plugin-opener';import{isSafeExternalUrl}from'./urlSafety'
export async function openExternalUrl(url:string){if(!isSafeExternalUrl(url))throw new Error('BLOCKED URL');if('__TAURI_INTERNALS__'in window)await openUrl(url);else window.open(url,'_blank','noopener,noreferrer')}
export const webSearchUrl=(query:string)=>`https://www.google.com/search?q=${encodeURIComponent(query)}`
