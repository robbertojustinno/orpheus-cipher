export type IconName = 'grid'|'search'|'terminal'|'file'|'archive'|'box'|'message'|'target'|'report'|'lock'|'arrow'|'trash'|'menu'|'close'
export interface NavItem { label:string; icon:IconName; badge?:number; alert?:boolean }
export interface OperatorIdentity { username:string; hostname:string; platform:string; arch:string }
export type NarrativeState = 'INITIAL'|'MONITORING'|'ANOMALY'|'DETECTED'|'MISSION_ACTIVE'
export type HydrationState = 'loading'|'ready'|'error'
export type EnigmaStatus = 'locked'|'available'|'active'|'solved'
export type EnigmaCategory = 'book'|'logic'|'cipher'|'osint'|'narrative'
export interface Enigma { id:string; number:number; title:string; subtitle:string; description:string; status:EnigmaStatus; progress:number; requiresPrevious?:string; requiresBookKnowledge?:boolean; category:EnigmaCategory; placeholderHint:string }
export type TerminalLogType = 'info'|'success'|'warning'|'danger'|'cipher'|'system'
export type TerminalSource = 'ORPHEUS'|'CIPHER'|'SYSTEM'|'WARNING'
export interface TerminalLog { id:string; timestamp:string; source:TerminalSource; type:TerminalLogType; message:string; kind?:'log'|'command'|'output' }
export type AuditEventType = 'COMMAND_EXECUTED'|'ENIGMA_OPENED'|'DOSSIER_ACCESSED'|'SECRET_COMMAND_DISCOVERED'|'MISSION_UPDATED'
export interface AuditEvent { id:string; type:AuditEventType; timestamp:string; resource?:string }
export interface PersistedEnigmaState { status:EnigmaStatus; progress:number }
export interface PersistedNarrativeState { version:number; narrativeState:NarrativeState; firstDetectionCompleted:boolean; missionStarted:boolean; founderId:number; founderTotal:number; enigmas:Record<string,PersistedEnigmaState>; unlockedFiles:string[]; restoredFragments:string[]; discoveredCommands:string[]; auditEvents:AuditEvent[]; lastSessionAt?:string }
export interface NarrativeProgress extends PersistedNarrativeState { operator:OperatorIdentity }
