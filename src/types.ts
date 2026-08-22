export type IconName = 'grid'|'search'|'terminal'|'file'|'archive'|'box'|'message'|'target'|'report'|'lock'|'arrow'|'trash'|'menu'|'close'
export interface NavItem { label:string; icon:IconName; badge?:number; alert?:boolean }
export interface OperatorIdentity { username:string; hostname:string; platform:string; arch:string }
export type NarrativeState = 'INITIAL'|'MONITORING'|'ANOMALY'|'DETECTED'|'MISSION_ACTIVE'
export type HydrationState = 'loading'|'ready'|'error'
export type EnigmaStatus = 'locked'|'available'|'active'|'solved'
export type EnigmaCategory = 'book'|'logic'|'cipher'|'osint'|'narrative'|'hybrid'
export type EnigmaDifficulty = 'easy'|'medium'|'hard'|'classified'
export type EnigmaEvidenceType = 'text'|'image'|'document'|'audio'|'code'|'metadata'|'terminal'
export interface EnigmaEvidence { id:string; type:EnigmaEvidenceType; title:string; contentRef:string; initiallyAvailable:boolean }
export interface EnigmaHint { id:string; level:number; textRef:string; unlockAfterAttempts?:number; unlockAfterSeconds?:number; penalty?:number }
export type UnlockEffectType = 'ENIGMA'|'FILE'|'MESSAGE'|'MISSION'|'DOSSIER'|'COMMAND'|'MAP_NODE'
export interface UnlockEffect { type:UnlockEffectType; targetId:string }
export interface HintPolicy { hints:EnigmaHint[] }
export interface EnigmaDefinition { id:string; number:number; title:string; codename?:string; subtitle:string; description:string; category:EnigmaCategory; categories?:EnigmaCategory[]; difficulty:EnigmaDifficulty; requiresBookKnowledge:boolean; prerequisiteIds?:string[]; /** Compatibilidade legada; a engine usa prerequisiteIds. */ requiresPrevious?:string; briefing:string; evidence?:EnigmaEvidence[]; hintPolicy:HintPolicy; validatorId:string; unlocks?:UnlockEffect[]; maxAttempts?:number; progressWeight?:number; foundersOnly?:boolean; founderRange?:{min:number;max:number} }
export interface Enigma extends EnigmaDefinition { status:EnigmaStatus; progress:number; attempts:number; hintsUnlocked:string[]; solvedAt?:string }
export type TerminalLogType = 'info'|'success'|'warning'|'danger'|'cipher'|'system'
export type TerminalSource = 'ORPHEUS'|'CIPHER'|'SYSTEM'|'WARNING'
export interface TerminalLog { id:string; timestamp:string; source:TerminalSource; type:TerminalLogType; message:string; kind?:'log'|'command'|'output' }
export type AuditEventType = 'COMMAND_EXECUTED'|'ENIGMA_OPENED'|'ENIGMA_ATTEMPTED'|'HINT_UNLOCKED'|'ENIGMA_SOLVED'|'UNLOCK_APPLIED'|'DOSSIER_ACCESSED'|'SECRET_COMMAND_DISCOVERED'|'MISSION_UPDATED'|'SEARCH_STARTED'|'SEARCH_COMPLETED'|'SEARCH_CANCELLED'|'RESULT_OPENED'|'REPORT_CREATED'
export interface AuditEvent { id:string; type:AuditEventType; timestamp:string; resource?:string }
export interface PersistedEnigmaState { status:EnigmaStatus; progress:number; attempts:number; hintsUnlocked:string[]; solvedAt?:string }
export interface PersistedNarrativeState { version:number; narrativeState:NarrativeState; firstDetectionCompleted:boolean; missionStarted:boolean; founderId:number; founderTotal:number; enigmas:Record<string,PersistedEnigmaState>; unlockedFiles:string[]; unlockedMessages:string[]; unlockedDossiers:string[]; unlockedMapNodes:string[]; restoredFragments:string[]; discoveredCommands:string[]; auditEvents:AuditEvent[]; currentMissionId?:string; lastSessionAt?:string }
export interface NarrativeProgress extends PersistedNarrativeState { operator:OperatorIdentity }
