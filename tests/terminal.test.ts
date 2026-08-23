import { describe, expect, it } from 'vitest'
import { enigmaDefinitions } from '../src/data/enigmas'
import { autocompleteCommand, executeCommand } from '../src/features/terminal/commandExecutor'
import { parseCommand } from '../src/features/terminal/commandParser'
import { getPublicCommands } from '../src/features/terminal/commandRegistry'
import { secretCommandRegistry } from '../src/features/terminal/secretCommands'
import { appendHistory } from '../src/features/terminal/terminalHistory'
import { createInitialPersistedNarrativeState } from '../src/services/narrativeStorage'
import type { CommandContext } from '../src/features/terminal/commandTypes'

const context=():CommandContext=>{
 const persisted=createInitialPersistedNarrativeState()
 persisted.narrativeState='MISSION_ACTIVE';persisted.firstDetectionCompleted=true;persisted.missionStarted=true
 persisted.enigmas['box-01']={status:'available',progress:0}
 return{progress:{...persisted,operator:{username:'Justino',hostname:'WFE067',platform:'windows',arch:'x86_64'}},enigmas:enigmaDefinitions.map(enigma=>({...enigma,status:persisted.enigmas[enigma.id].status,progress:persisted.enigmas[enigma.id].progress})),history:['status','whoami']}
}

describe('parser ORPHEUS',()=>{
 it('normaliza espaços e caixa',()=>expect(parseCommand('  WHOAMI  ')).toMatchObject({command:'whoami',args:[]}))
 it('preserva argumentos com aspas',()=>expect(parseCommand('search "evelyn cross"')).toMatchObject({command:'search',args:['evelyn cross']}))
 it('separa múltiplos argumentos',()=>expect(parseCommand('open   enigma  01')).toMatchObject({command:'open',args:['enigma','01']}))
})

describe('command registry',()=>{
 it('help lista comandos públicos e não revela secrets',()=>{const result=executeCommand('help',context()).output;expect(result).toContain('status');expect(result).toContain('privacy');for(const secret of secretCommandRegistry)expect(result).not.toContain(secret.trigger)})
 it('status usa estado real',()=>{const result=executeCommand('status',context()).output;expect(result).toContain('MISSION_ACTIVE');expect(result).toContain('JUSTINO');expect(result).toContain('01/30')})
 it('whoami e alias id identificam o operador',()=>{expect(executeCommand('whoami',context()).output).toContain('JUSTINO');expect(executeCommand('id',context()).output).toContain('IDENTITY CONFIRMED')})
 it('host usa somente identidade local permitida',()=>{const result=executeCommand('host',context()).output;expect(result).toContain('WFE067');expect(result).toContain('WINDOWS');expect(result).toContain('X86_64')})
 it('mission destaca o objetivo',()=>expect(executeCommand('mission',context()).actions).toContainEqual({type:'highlight-objective'}))
 it('enigmas reflete status persistido',()=>{const result=executeCommand('enigmas',context()).output;expect(result).toContain('AVAILABLE');expect(result).toContain('LOCKED')})
 it('open disponível reutiliza ação de modal',()=>expect(executeCommand('open enigma 01',context()).actions).toContainEqual({type:'open-enigma',enigmaId:'box-01'}))
 it('open bloqueado nega acesso',()=>expect(executeCommand('open 02',context()).output).toContain('ACCESS DENIED'))
 it('dossier roteia índice permitido',()=>expect(executeCommand('dossier evelyn',context()).actions).toContainEqual({type:'open-dossier',subject:'evelyn'}))
 it('search prepara consulta sem executar externamente',()=>expect(executeCommand('search evelyn cross',context()).actions).toContainEqual({type:'prepare-search',query:'evelyn cross'}))
 it('clear limpa somente visualização',()=>expect(executeCommand('cls',context()).actions).toContainEqual({type:'clear'}))
 it('history mostra histórico da sessão',()=>expect(executeCommand('history',context()).output).toContain('whoami'))
 it('comando inválido retorna mensagem controlada',()=>expect(executeCommand('banana',context()).output).toContain('COMMAND NOT RECOGNIZED'))
 it('aliases são centralizados',()=>{expect(executeCommand('missions',context()).output).toContain('CURRENT OBJECTIVE');expect(executeCommand('msg',context()).output).toContain('MESSAGE INDEX')})
 it('autocomplete completa único e lista múltiplos',()=>{expect(autocompleteCommand('doss').value).toBe('dossier');expect(autocompleteCommand('m').suggestions).toEqual(expect.arrayContaining(['mission','messages']))})
 it('autocomplete não inclui comandos secretos',()=>{const publicNames=getPublicCommands().map(command=>command.name);for(const secret of secretCommandRegistry)expect(publicNames).not.toContain(secret.trigger)})
 it('evita duplicações consecutivas no histórico',()=>expect(appendHistory(['status'],'status')).toEqual(['status']))
})

describe('Phase 6 investigation commands',()=>{
 it.each([['entities','entities'],['relationships','relationships'],['links','relationships'],['timeline','timeline'],['graph','graph'],['evidence','evidence'],['investigation','investigation'],['trace example.com','trace']])('%s routes only to the internal workspace',(input,action)=>expect(executeCommand(input,context()).actions).toContainEqual(expect.objectContaining({type:'osint',action})))
})

describe('segurança do terminal',()=>{
 it.each(['powershell Get-ChildItem','cmd.exe /c dir','cmd /c dir','bash -c ls','sh -c ls','curl https://example.com','wget https://example.com'])('%s permanece dentro do parser',input=>{const result=executeCommand(input,context());expect(result.output).toContain('COMMAND NOT RECOGNIZED');expect(result.actions).toBeUndefined()})
})
