import{describe,expect,it}from'vitest'
import{normalizeAnswer}from'../src/features/enigmas/engine/answerNormalizer'
import{attemptEnigma,activateEnigma}from'../src/features/enigmas/engine/enigmaEngine'
import{LocalDevelopmentValidator,ProductionValidator,hasDevelopmentAnswers}from'../src/features/enigmas/engine/enigmaValidator'
import{getNextHint}from'../src/features/enigmas/engine/hintEngine'
import{applyUnlockEffects}from'../src/features/enigmas/engine/unlockEngine'
import{calculateOverallProgress,prerequisitesSatisfied}from'../src/features/enigmas/engine/progressionEngine'
import{createInitialPersistedNarrativeState,migrateNarrativeState,WebNarrativePersistence}from'../src/services/narrativeStorage'
import{enigmaDefinitions}from'../src/data/enigmas'
import{executeCommand}from'../src/features/terminal/commandExecutor'
import{redactSensitiveCommand}from'../src/features/terminal/terminalHistory'

const definition=enigmaDefinitions[0]
const available=()=>{const state=createInitialPersistedNarrativeState();state.enigmas['box-01'].status='available';return state}
describe('ORPHEUS enigma engine',()=>{
 it('normalizes unicode, accents, punctuation and whitespace',()=>expect(normalizeAnswer('  CÍPHER!!!  ')).toBe('cipher'))
 it('accepts clearly fictitious DEV answer',async()=>expect((await attemptEnigma(definition,'DEV-ANSWER-01',available(),new LocalDevelopmentValidator(),true)).result.correct).toBe(true))
 it('rejects incorrect answer and increments attempt',async()=>{const result=await attemptEnigma(definition,'wrong',available(),new LocalDevelopmentValidator(),true);expect(result.result.feedbackCode).toBe('INCORRECT');expect(result.state.enigmas['box-01'].attempts).toBe(1);expect(result.state.enigmas['box-01'].status).toBe('active')})
 it('production validator has no local canonical validation',async()=>expect((await new ProductionValidator().validate()).feedbackCode).toBe('VALIDATOR_UNAVAILABLE'))
 it('DEV answers are gated by development build',()=>expect(hasDevelopmentAnswers()).toBe(import.meta.env.DEV))
 it('activates an available enigma',()=>expect(activateEnigma(available(),'box-01').enigmas['box-01'].status).toBe('active'))
 it('keeps hint locked before required attempts',()=>expect(getNextHint(definition,available().enigmas['box-01']).allowed).toBe(false))
 it('unlocks progressive hint after attempts',()=>{const state=available().enigmas['box-01'];state.attempts=2;expect(getNextHint(definition,state)).toMatchObject({allowed:true,hintId:'box-01-hint-01'})})
 it('enforces prerequisites',()=>{const state=available();expect(prerequisitesSatisfied(enigmaDefinitions[1],state)).toBe(false);state.enigmas['box-01'].status='solved';expect(prerequisitesSatisfied(enigmaDefinitions[1],state)).toBe(true)})
 it('applies typed unlock effects',()=>{const state=applyUnlockEffects(available(),[{type:'FILE',targetId:'file-dev'},{type:'MAP_NODE',targetId:'node-dev'}]);expect(state.unlockedFiles).toContain('file-dev');expect(state.unlockedMapNodes).toContain('node-dev')})
 it('solves and unlocks next enigma',async()=>{const result=await attemptEnigma(definition,'DEV-ANSWER-01',available(),new LocalDevelopmentValidator(),true);expect(result.state.enigmas['box-01'].status).toBe('solved');expect(result.state.enigmas['box-02'].status).toBe('available')})
 it('calculates weighted progress',()=>{const state=available();state.enigmas['box-01'].progress=100;expect(calculateOverallProgress(enigmaDefinitions,state)).toBe(25)})
 it('migrates and restores attempts and hints',()=>{const state=available();state.enigmas['box-01']={status:'active',progress:15,attempts:2,hintsUnlocked:['box-01-hint-01']};expect(migrateNarrativeState(state).enigmas['box-01']).toMatchObject({status:'active',attempts:2,hintsUnlocked:['box-01-hint-01']})})
 it('persists and restores enigma state',async()=>{const memory=new Map<string,string>();const storage={getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>{memory.set(k,v)},removeItem:(k:string)=>{memory.delete(k)}};const adapter=new WebNarrativePersistence(storage);const state=available();state.enigmas['box-01']={status:'active',progress:20,attempts:2,hintsUnlocked:['box-01-hint-01']};await adapter.save(state);expect((await adapter.load())?.enigmas['box-01']).toEqual(state.enigmas['box-01'])})
 it('integrates terminal hint and answer commands',()=>{const state=available();const enigma={...definition,...state.enigmas['box-01']};const context={progress:{...state,operator:{username:'TEST',hostname:'HOST',platform:'windows',arch:'x86_64'}},enigmas:[enigma],history:[]};expect(executeCommand('hint 01',context).actions?.[0].type).toBe('request-hint');expect(executeCommand('answer 01 test value',context).actions?.[0].type).toBe('submit-answer')})
 it('redacts answer from terminal history',()=>{const masked=redactSensitiveCommand('answer 01 SUPER-SECRET');expect(masked).toBe('answer 01 [REDACTED]');expect(masked).not.toContain('SUPER-SECRET')})
 it('never persists entered answer in state or audit',async()=>{const state=available();const result=await attemptEnigma(definition,'SUPER-SECRET',state,new LocalDevelopmentValidator(),true);expect(JSON.stringify(result.state)).not.toContain('SUPER-SECRET')})
})
