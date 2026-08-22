import type { EnigmaDefinition } from '../types'

const placeholderEvidence=(box:string)=>[
  {id:`${box}-evidence-01`,type:'document' as const,title:'FRAGMENTO // DEVELOPMENT PLACEHOLDER',contentRef:'Conteúdo temporário sem informação canônica.',initiallyAvailable:true},
  {id:`${box}-evidence-02`,type:'metadata' as const,title:'METADADOS // DEVELOPMENT PLACEHOLDER',contentRef:'Evidência será definida após validação do manuscrito.',initiallyAvailable:true},
  {id:`${box}-evidence-03`,type:'terminal' as const,title:'REGISTRO // CLASSIFIED',contentRef:'Conteúdo narrativo ainda não configurado.',initiallyAvailable:false},
]
const placeholderHints=(box:string)=>({hints:[
  {id:`${box}-hint-01`,level:1,textRef:'DEVELOPMENT PLACEHOLDER — observe novamente as evidências disponíveis.',unlockAfterAttempts:2},
  {id:`${box}-hint-02`,level:2,textRef:'DEVELOPMENT PLACEHOLDER — a resposta poderá exigir consulta ao livro.',unlockAfterAttempts:4},
  {id:`${box}-hint-03`,level:3,textRef:'DEVELOPMENT PLACEHOLDER — nenhuma pista canônica foi configurada.',unlockAfterAttempts:6},
]})

export const enigmaDefinitions:EnigmaDefinition[]=[
 {id:'box-01',number:1,title:'Enigma 01 — A Caixa',codename:'A CAIXA',subtitle:'BOOK / NARRATIVE',description:'A primeira peça sempre revela mais do que guarda.',category:'book',categories:['book','narrative'],difficulty:'classified',requiresBookKnowledge:true,briefing:'DEVELOPMENT PLACEHOLDER — o briefing definitivo será derivado do manuscrito validado.',evidence:placeholderEvidence('box-01'),hintPolicy:placeholderHints('box-01'),validatorId:'external-canonical',unlocks:[{type:'ENIGMA',targetId:'box-02'}],progressWeight:1},
 {id:'box-02',number:2,title:'Enigma 02 — CIPHER',codename:'CIPHER',subtitle:'CIPHER',description:'Linguagem, padrão, chave. O código está onde não se vê.',category:'cipher',difficulty:'classified',requiresBookKnowledge:false,prerequisiteIds:['box-01'],requiresPrevious:'box-01',briefing:'DEVELOPMENT PLACEHOLDER — cifra, pergunta e solução ainda não foram definidas.',evidence:placeholderEvidence('box-02'),hintPolicy:placeholderHints('box-02'),validatorId:'external-canonical',unlocks:[{type:'ENIGMA',targetId:'box-03'}],progressWeight:1},
 {id:'box-03',number:3,title:'Enigma 03 — Evelyn',codename:'EVELYN',subtitle:'BOOK / ANALYSIS',description:'Memórias fragmentadas. Confie, mas verifique.',category:'book',categories:['book','logic'],difficulty:'classified',requiresBookKnowledge:true,prerequisiteIds:['box-02'],requiresPrevious:'box-02',briefing:'DEVELOPMENT PLACEHOLDER — análise narrativa pendente de validação do manuscrito.',evidence:placeholderEvidence('box-03'),hintPolicy:placeholderHints('box-03'),validatorId:'external-canonical',unlocks:[{type:'ENIGMA',targetId:'box-04'}],progressWeight:1},
 {id:'box-04',number:4,title:'Enigma 04 — Orpheus',codename:'ORPHEUS',subtitle:'NARRATIVE / HYBRID',description:'O protocolo desperta quando tudo se conecta.',category:'hybrid',categories:['narrative','hybrid'],difficulty:'classified',requiresBookKnowledge:true,prerequisiteIds:['box-01','box-02','box-03'],requiresPrevious:'box-03',briefing:'DEVELOPMENT PLACEHOLDER — desafio combinado ainda sem conteúdo canônico.',evidence:placeholderEvidence('box-04'),hintPolicy:placeholderHints('box-04'),validatorId:'external-canonical',progressWeight:1},
]
