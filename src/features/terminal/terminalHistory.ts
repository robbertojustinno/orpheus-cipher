export function appendHistory(history:string[],command:string){const value=command.trim();if(!value||history.at(-1)===value)return history;return[...history,value]}
export function historyAt(history:string[],index:number){return history[Math.max(0,Math.min(index,history.length-1))]??''}
