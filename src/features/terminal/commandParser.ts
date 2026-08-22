import type { ParsedCommand } from './commandTypes'

/** Tokeniza somente a gramática interna ORPHEUS. Nunca encaminha entrada ao sistema operacional. */
export function parseCommand(rawInput:string):ParsedCommand{
  const trimmed=rawInput.trim()
  if(!trimmed)return{command:'',args:[],rawInput}
  const tokens:string[]=[]
  const pattern=/"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^\s]+)/g
  let match:RegExpExecArray|null
  while((match=pattern.exec(trimmed))!==null){tokens.push((match[1]??match[2]??match[3]).replace(/\\(["'\\])/g,'$1'))}
  const[command='',...args]=tokens
  return{command:command.toLowerCase(),args,rawInput}
}
