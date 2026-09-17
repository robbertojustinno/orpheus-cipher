import{describe,expect,it}from'vitest'
import{enigmaDefinitions,MAIN_ENIGMA_COUNT}from'../src/data/enigmas'
import{attemptEnigma}from'../src/features/enigmas/engine/enigmaEngine'
import{LocalDevelopmentValidator}from'../src/features/enigmas/engine/enigmaValidator'
import{calculateOverallProgress,prerequisitesSatisfied}from'../src/features/enigmas/engine/progressionEngine'
import{createInitialPersistedNarrativeState,migrateNarrativeState}from'../src/services/narrativeStorage'

describe('ORPHEUS Phase 8 campaign',()=>{
 it('registers exactly 12 ordered main enigmas without embedding canonical answers',()=>{expect(MAIN_ENIGMA_COUNT).toBe(12);expect(enigmaDefinitions.map(item=>item.number)).toEqual(Array.from({length:12},(_,index)=>index+1));expect(JSON.stringify(enigmaDefinitions).toLowerCase()).not.toContain('dev-answer')})
 it('keeps every main enigma dependent on the previous operation',()=>{const state=createInitialPersistedNarrativeState();for(let index=1;index<enigmaDefinitions.length;index++){expect(prerequisitesSatisfied(enigmaDefinitions[index],state)).toBe(false);state.enigmas[enigmaDefinitions[index-1].id].status='solved';expect(prerequisitesSatisfied(enigmaDefinitions[index],state)).toBe(true)}})
 it('simulates the complete campaign with fictitious DEV credentials only',async()=>{let state=createInitialPersistedNarrativeState();state.enigmas['box-01'].status='available';for(const definition of enigmaDefinitions){const answer=`DEV-ANSWER-${String(definition.number).padStart(2,'0')}`;const outcome=await attemptEnigma(definition,answer,state,new LocalDevelopmentValidator(),true);expect(outcome.result.correct).toBe(true);state=outcome.state}expect(Object.values(state.enigmas).every(item=>item.status==='solved')).toBe(true);expect(calculateOverallProgress(enigmaDefinitions,state)).toBe(100);expect(state.currentMissionId).toBe('operation-complete')})
 it('migrates Phase 7 saves and initializes all new campaign fields safely',()=>{const migrated=migrateNarrativeState({version:1,narrativeState:'MISSION_ACTIVE',missionStarted:true,enigmas:{'box-01':{status:'solved',progress:100}}});expect(migrated.version).toBe(2);expect(migrated.enigmas['box-12'].status).toBe('locked');expect(migrated.campaignCompleted).toBe(false);expect(migrated.secretDiscoveries).toEqual([]);expect(migrated.unlockedBadges).toEqual([])})
 it('never stores submitted answer material in campaign state',async()=>{const state=createInitialPersistedNarrativeState();state.enigmas['box-01'].status='available';const outcome=await attemptEnigma(enigmaDefinitions[0],'PRIVATE-CANDIDATE',state,new LocalDevelopmentValidator(),true);expect(JSON.stringify(outcome.state)).not.toContain('PRIVATE-CANDIDATE')})
})
