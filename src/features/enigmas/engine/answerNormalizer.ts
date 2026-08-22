export interface AnswerNormalizationOptions { removeAccents?:boolean; removePunctuation?:boolean }
export function normalizeAnswer(input:string,options:AnswerNormalizationOptions={removeAccents:true,removePunctuation:true}){
 let value=input.normalize('NFKC').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g,' ')
 if(options.removeAccents)value=value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').normalize('NFC')
 if(options.removePunctuation)value=value.replace(/[^\p{L}\p{N}\s-]/gu,'').replace(/\s+/g,' ').trim()
 return value
}
