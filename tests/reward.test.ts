import{describe,expect,it}from'vitest'
import{createInitialPersistedNarrativeState}from'../src/services/narrativeStorage'
import{completionProof}from'../src/features/reward/useSecretReward'
import{validEmail,validRewardForm}from'../src/features/reward/rewardService'
import type{NarrativeProgress}from'../src/types'
const progress=(solved:number,campaignCompleted=false):NarrativeProgress=>{const base=createInitialPersistedNarrativeState(),ids=Object.keys(base.enigmas).slice(0,solved);for(const id of ids)base.enigmas[id]={...base.enigmas[id],status:'solved',progress:100,solvedAt:'2026-08-24T12:00:00.000Z'};base.campaignCompleted=campaignCompleted;base.completionDate=campaignCompleted?'2026-08-24T12:00:00.000Z':undefined;base.auditEvents=campaignCompleted?[{id:'completion-rc3',type:'ENIGMA_SOLVED',timestamp:base.completionDate!,resource:'box-12'}]:[];return{...base,operator:{username:'',hostname:'',platform:'test',arch:'test'}}}
describe('secret reward gate',()=>{
it('99 percent exposes no valid completion proof',()=>{const proof=completionProof(progress(11,false));expect(proof.progress).toBe(92);expect(proof.campaignCompleted).toBe(false);expect(proof.completionId).toBe('')})
it('100 percent creates the complete proof only after campaign completion',()=>{const proof=completionProof(progress(12,true));expect(proof).toMatchObject({progress:100,campaignCompleted:true,completionId:'completion-rc3'});expect(proof.solvedIds).toHaveLength(12)})
it('requires display name, valid email and confirmation',()=>{expect(validRewardForm({displayName:'',email:'operator@example.test',confirmed:true})).toBe(false);expect(validRewardForm({displayName:'Operator',email:'invalid',confirmed:true})).toBe(false);expect(validRewardForm({displayName:'Operator',email:'operator@example.test',confirmed:false})).toBe(false);expect(validRewardForm({displayName:'Operator',email:'operator@example.test',confirmed:true})).toBe(true)})
it('validates email syntax',()=>{expect(validEmail('operator@example.test')).toBe(true);expect(validEmail('operator@')).toBe(false)})
it('does not require address for digital-only claims',()=>expect(validRewardForm({displayName:'Operator',email:'operator@example.test',confirmed:true},false)).toBe(true))
it('requires all shipping fields and consent for a physical claim',()=>{const partial={displayName:'Operator',email:'operator@example.test',confirmed:true};expect(validRewardForm(partial,true)).toBe(false);expect(validRewardForm({...partial,fullName:'Operator Test',address:'Test Street',addressNumber:'1',postalCode:'00000-000',city:'Test City',state:'TS',country:'BR',phone:'+550000000000',physicalConsent:true},true)).toBe(true)})
})
