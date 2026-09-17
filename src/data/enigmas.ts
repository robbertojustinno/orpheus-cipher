import type { EnigmaCategory, EnigmaDefinition, EnigmaDifficulty, UnlockEffect } from '../types'

interface PublicEnigmaSeed { title:string; codename:string; subtitle:string; description:string; category:EnigmaCategory; categories?:EnigmaCategory[]; difficulty:EnigmaDifficulty; book:boolean }

const seeds:PublicEnigmaSeed[]=[
 {title:'A Caixa',codename:'A CAIXA',subtitle:'BOOK / NARRATIVE',description:'A primeira peça revela mais do que guarda.',category:'book',categories:['book','narrative'],difficulty:'easy',book:true},
 {title:'CIPHER',codename:'CIPHER',subtitle:'CIPHER / BOOK',description:'Uma autenticação antiga exige memória e interpretação.',category:'cipher',categories:['cipher','book'],difficulty:'medium',book:true},
 {title:'Evelyn',codename:'EVELYN',subtitle:'BOOK / ANALYSIS',description:'A função importa tanto quanto a identidade.',category:'book',categories:['book','logic'],difficulty:'medium',book:true},
 {title:'Orpheus',codename:'ORPHEUS',subtitle:'NARRATIVE / HYBRID',description:'Fragmentos isolados formam uma arquitetura maior.',category:'hybrid',categories:['narrative','hybrid'],difficulty:'medium',book:true},
 {title:'Fragmento',codename:'FRAGMENTO',subtitle:'LOGIC / NARRATIVE',description:'Três sinais ativos apontam para uma única estrutura.',category:'logic',categories:['logic','narrative'],difficulty:'medium',book:true},
 {title:'Seis Cordas',codename:'SEIS CORDAS',subtitle:'BOOK / PATTERN',description:'Uma alteração mínima transmite informação sem palavras.',category:'book',categories:['book','logic'],difficulty:'hard',book:true},
 {title:'Credencial',codename:'CREDENCIAL',subtitle:'CIPHER / ANALYSIS',description:'Uma autorização esquecida ainda atravessa o legado.',category:'cipher',categories:['cipher','logic'],difficulty:'hard',book:true},
 {title:'Mirror',codename:'MIRROR',subtitle:'NARRATIVE / TEMPORAL',description:'A janela visível não contém o instante decisivo.',category:'hybrid',categories:['narrative','logic'],difficulty:'hard',book:true},
 {title:'Glasshouse',codename:'GLASSHOUSE',subtitle:'BOOK / IDENTITY',description:'A imagem aceita pelo sistema não prova quem estava diante dele.',category:'book',categories:['book','logic'],difficulty:'hard',book:true},
 {title:'Terceiro Fator',codename:'TERCEIRO FATOR',subtitle:'NARRATIVE / ANALYSIS',description:'O modelo falha quando encontra uma decisão que nunca registrou.',category:'narrative',categories:['narrative','logic'],difficulty:'hard',book:true},
 {title:'Protocolo',codename:'PROTOCOLO',subtitle:'HYBRID / CIPHER',description:'Preservar a verdade não exige preservar a autoridade.',category:'hybrid',categories:['hybrid','cipher'],difficulty:'classified',book:true},
 {title:'Última Chave',codename:'ÚLTIMA CHAVE',subtitle:'BOOK / CONVERGENCE',description:'A última recuperação altera o significado do nome.',category:'hybrid',categories:['book','narrative','hybrid'],difficulty:'classified',book:true},
]

const unlocks=(number:number):UnlockEffect[]=>[
 ...(number<12?[{type:'ENIGMA' as const,targetId:`box-${String(number+1).padStart(2,'0')}`}]:[]),
 {type:'FILE',targetId:`operation-fragment-${String(number).padStart(2,'0')}`},
 {type:'MAP_NODE',targetId:`campaign-node-${String(number).padStart(2,'0')}`},
 ...(number%3===0?[{type:'MESSAGE' as const,targetId:`cipher-message-${String(number/3).padStart(2,'0')}`}]:[]),
 ...(number===12?[{type:'MISSION' as const,targetId:'operation-complete'}]:[]),
]

export const enigmaDefinitions:EnigmaDefinition[]=seeds.map((seed,index)=>{
 const number=index+1,id=`box-${String(number).padStart(2,'0')}`
 return{id,number,title:`Enigma ${String(number).padStart(2,'0')} — ${seed.title}`,codename:seed.codename,subtitle:seed.subtitle,description:seed.description,category:seed.category,categories:seed.categories,difficulty:seed.difficulty,requiresBookKnowledge:seed.book,...(number>1?{prerequisiteIds:[`box-${String(number-1).padStart(2,'0')}`],requiresPrevious:`box-${String(number-1).padStart(2,'0')}`}:{prerequisiteIds:[]}),briefing:'Conteúdo classificado. A autorização narrativa será carregada pelo canal seguro ORPHEUS.',evidence:[{id:`${id}-evidence-01`,type:'document',title:'FRAGMENTO AUTORIZADO',contentRef:'Aguardando conteúdo classificado.',initiallyAvailable:true},{id:`${id}-evidence-02`,type:'metadata',title:'METADADOS CORRELACIONADOS',contentRef:'Aguardando conteúdo classificado.',initiallyAvailable:true},{id:`${id}-evidence-03`,type:'terminal',title:'REGISTRO CIPHER',contentRef:'Acesso condicionado à progressão.',initiallyAvailable:false}],hintPolicy:{hints:[1,2,3].map(level=>({id:`${id}-hint-${String(level).padStart(2,'0')}`,level,textRef:'Pista classificada disponível pelo canal seguro.',unlockAfterAttempts:level*2}))},validatorId:'external-canonical-v1',unlocks:unlocks(number),progressWeight:1}
})

export const MAIN_ENIGMA_COUNT=enigmaDefinitions.length
