export function appendHistory(history:string[],command:string){const value=command.trim();if(!value||history.at(-1)===value)return history;return[...history,value]}
export function historyAt(history:string[],index:number){return history[Math.max(0,Math.min(index,history.length-1))]??''}
export function redactSensitiveCommand(command:string){return/^answer\s+/i.test(command)?command.replace(/^(answer\s+\S+)\s+.+$/i,'$1 [REDACTED]'):command}
