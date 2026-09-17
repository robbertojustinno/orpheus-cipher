import { normalizeAnswer } from './answerNormalizer'
import type { EnigmaValidator, ValidationContext, ValidationResult } from './enigmaTypes'
import { validateCanonicalAnswer } from '../services/canonicalContent'

const DEV_ANSWERS:Readonly<Record<string,string>>=import.meta.env.DEV?Object.freeze(Object.fromEntries(Array.from({length:12},(_,index)=>[`box-${String(index+1).padStart(2,'0')}`,`dev-answer-${String(index+1).padStart(2,'0')}`]))):Object.freeze({})
export const hasDevelopmentAnswers=()=>import.meta.env.DEV&&Object.keys(DEV_ANSWERS).length>0

export class LocalDevelopmentValidator implements EnigmaValidator{
 async validate(enigmaId:string,answer:string,context:ValidationContext):Promise<ValidationResult>{
  if(!context.development||!import.meta.env.DEV)return{correct:false,feedbackCode:'VALIDATOR_UNAVAILABLE'}
  if(!answer.trim())return{correct:false,feedbackCode:'INVALID_FORMAT'}
  const expected=DEV_ANSWERS[enigmaId]
  if(!expected)return{correct:false,feedbackCode:'VALIDATOR_UNAVAILABLE'}
  const correct=normalizeAnswer(answer)===expected
  return{correct,feedbackCode:correct?'CORRECT':'INCORRECT',unlockEffects:correct?context.definition.unlocks:undefined}
 }
}
export class ProductionValidator implements EnigmaValidator{
 async validate(enigmaId:string,answer:string,context:ValidationContext):Promise<ValidationResult>{
  if(!answer.trim())return{correct:false,feedbackCode:'INVALID_FORMAT'}
  const feedbackCode=await validateCanonicalAnswer(enigmaId,answer,{founderId:context.state.founderId,founderTotal:context.state.founderTotal})
  return{correct:feedbackCode==='CORRECT',feedbackCode,unlockEffects:feedbackCode==='CORRECT'?context.definition.unlocks:undefined}
 }
}
export function createEnigmaValidator():EnigmaValidator{return import.meta.env.DEV?new LocalDevelopmentValidator():new ProductionValidator()}
