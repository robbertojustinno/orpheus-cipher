import type { Enigma, NarrativeProgress, TerminalLogType } from '../../types'

export interface ParsedCommand { command:string; args:string[]; rawInput:string }
export type TerminalAction =
  | {type:'clear'}
  | {type:'navigate';destination:string}
  | {type:'open-enigma';enigmaId:string}
  | {type:'highlight-objective'}
  | {type:'prepare-search';query:string}
  | {type:'open-dossier';subject:string}

export interface CommandResult { output:string; tone?:TerminalLogType; delayMs?:number; pendingText?:string; actions?:TerminalAction[] }
export interface CommandContext { progress:NarrativeProgress; enigmas:Enigma[]; history:string[] }
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
