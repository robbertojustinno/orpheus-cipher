import { commandRegistry, findCommand } from './commandRegistry'
import { parseCommand } from './commandParser'
import { findSecretCommand } from './secretCommands'
import type { CommandContext, CommandResult } from './commandTypes'
import { canonicalNarrativeConfigured } from '../enigmas/services/canonicalContent'

export function executeCommand(rawInput:string,context:CommandContext):CommandResult{
 const parsed=parseCommand(rawInput)
 if(!parsed.command)return{output:''}
 const command=findCommand(parsed.command)
 if(command){if(command.requiresMission&&!context.progress.missionStarted)return{output:'ACCESS DENIED\n\nMISSION SEQUENCE NOT ACTIVE.',tone:'danger'};return command.execute(parsed.args,context)}
 const secret=findSecretCommand(parsed.command)
 if(secret)return secret.execute(parsed.args,context)
 if(canonicalNarrativeConfigured())return{output:'CHECKING CLASSIFIED INDEX...',delayMs:180,pendingText:'VALIDATING...',actions:[{type:'validate-secret',rawInput:parsed.rawInput}],sensitive:true}
 return{output:'COMMAND NOT RECOGNIZED\n\nTYPE "help" FOR AVAILABLE COMMANDS.',tone:'warning'}
}

export function autocompleteCommand(input:string){
 const trimmed=input.trimStart();const parts=trimmed.split(/\s+/);const token=parts[0]?.toLowerCase()??''
 if(parts.length>1){const command=findCommand(token);if(command?.name==='open'){const options=Array.from({length:12},(_,index)=>`enigma ${String(index+1).padStart(2,'0')}`);const prefix=parts.slice(1).join(' ').toLowerCase();const matches=options.filter(option=>option.startsWith(prefix));return{value:matches.length===1?`open ${matches[0]}`:input,suggestions:matches}}if(command?.name==='dossier'){const options=['blake','evelyn','gordon','cipher','orpheus'];const prefix=parts[1]?.toLowerCase()??'';const matches=options.filter(option=>option.startsWith(prefix));return{value:matches.length===1?`dossier ${matches[0]}`:input,suggestions:matches}}return{value:input,suggestions:[]}}
 const candidates=[...new Set(commandRegistry.filter(command=>!command.hidden).flatMap(command=>[command.name,...(command.aliases??[])]))].filter(name=>name.startsWith(token))
 return{value:candidates.length===1?findCommand(candidates[0])?.name??candidates[0]:input,suggestions:candidates.map(name=>findCommand(name)?.name??name).filter((name,index,list)=>list.indexOf(name)===index)}
}
