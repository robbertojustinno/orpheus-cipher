import{load}from'@tauri-apps/plugin-store'
export type MasterResetScope='searches'|'investigations'
export async function resetMasterScope(scope:MasterResetScope){if(!('__TAURI_INTERNALS__'in window)){if(scope==='searches')localStorage.removeItem('orpheus.osint.sessions.v1');else localStorage.removeItem('orpheus.investigations.v1');return}const file=scope==='searches'?'orpheus-search.json':'orpheus-investigations.json',key=scope==='searches'?'sessions':'investigations';const store=await load(file,{autoSave:false,defaults:{}});await store.delete(key);await store.save()}
