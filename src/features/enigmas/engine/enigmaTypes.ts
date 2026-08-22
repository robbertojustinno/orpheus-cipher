import type { EnigmaDefinition, PersistedNarrativeState, UnlockEffect } from '../../../types'

export type ValidationFeedbackCode='CORRECT'|'INCORRECT'|'PARTIAL'|'INVALID_FORMAT'|'VALIDATOR_UNAVAILABLE'
export interface ValidationContext { definition:EnigmaDefinition; state:PersistedNarrativeState; development:boolean }
export interface ValidationResult { correct:boolean; feedbackCode:ValidationFeedbackCode; unlockEffects?:UnlockEffect[] }
export interface EnigmaValidator { validate(enigmaId:string,answer:string,context:ValidationContext):Promise<ValidationResult> }
export interface HintAccessResult { allowed:boolean; hintId?:string; textRef?:string; reason?:'NO_HINTS'|'ANALYSIS_REQUIRED'|'ALL_UNLOCKED' }
export interface EnigmaEvent { type:'ENIGMA_OPENED'|'ENIGMA_ATTEMPTED'|'HINT_UNLOCKED'|'ENIGMA_SOLVED'|'UNLOCK_APPLIED'; enigmaId:string; targetId?:string; timestamp:string }
