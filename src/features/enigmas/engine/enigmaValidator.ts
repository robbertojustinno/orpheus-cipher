import { normalizeAnswer } from './answerNormalizer'
import type { EnigmaValidator, ValidationContext, ValidationResult } from './enigmaTypes'

const DEV_ANSWERS:Readonly<Record<string,string>>=import.meta.env.DEV?Object.freeze({'box-01':'dev-answer-01','box-02':'dev-answer-02','box-03':'dev-answer-03','box-04':'dev-answer-04'}):Object.freeze({})
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
 async validate():Promise<ValidationResult>{return{correct:false,feedbackCode:'VALIDATOR_UNAVAILABLE'}}
}
export function createEnigmaValidator():EnigmaValidator{return import.meta.env.DEV?new LocalDevelopmentValidator():new ProductionValidator()}
