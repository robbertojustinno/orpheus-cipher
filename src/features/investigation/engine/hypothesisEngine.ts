import type{OperatorHypothesis}from'../types/investigation';import{stableId}from'./identity'
export function createHypothesis(text:string,entityIds:string[]=[]):OperatorHypothesis{const createdAt=new Date().toISOString();return{id:stableId('hyp',createdAt,text),text:text.trim(),createdAt,entityIds,label:'OPERATOR HYPOTHESIS'}}
