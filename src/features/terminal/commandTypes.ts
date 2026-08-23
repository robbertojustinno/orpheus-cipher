import type { Enigma, NarrativeProgress, TerminalLogType } from '../../types'
import type { LicenseIdentity } from '../license/types/license'

export interface ParsedCommand { command:string; args:string[]; rawInput:string }
export type TerminalAction =
  | {type:'clear'}
  | {type:'navigate';destination:string}
  | {type:'open-enigma';enigmaId:string}
  | {type:'highlight-objective'}
  | {type:'prepare-search';query:string}
  | {type:'open-dossier';subject:string}
  | {type:'request-hint';enigmaId:string}
  | {type:'submit-answer';enigmaId:string;answer:string}
  | {type:'osint';action:'prepare'|'run'|'correlate'|'report'|'export'|'investigation'|'entities'|'relationships'|'timeline'|'graph'|'evidence'|'trace';query?:string;mode?:'quick'|'deep'|'dork';format?:'json'|'csv'}

export interface CommandResult { output:string; tone?:TerminalLogType; delayMs?:number; pendingText?:string; actions?:TerminalAction[]; sensitive?:boolean }
export interface CommandContext { progress:NarrativeProgress; enigmas:Enigma[]; history:string[]; license?:LicenseIdentity }
export type CommandHandler=(args:string[],context:CommandContext)=>CommandResult

export interface OrpheusCommand {
  name:string
  aliases?:string[]
  description:string
  hidden?:boolean
  requiresMission?:boolean
  requiresBookKnowledge?:boolean
  execute:CommandHandler
}

export interface SecretCommand {
  id:string
  trigger:string
  aliases?:string[]
  requiresBookKnowledge:boolean
  discovered:boolean
  oneTime?:boolean
  effect?:string
  execute:CommandHandler
}
