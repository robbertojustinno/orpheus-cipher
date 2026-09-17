import{describe,expect,it}from'vitest'
import{parseCanonicalEnigmaPublicContent,parseRevealedCanonicalHint}from'../src/features/enigmas/services/canonicalContent'
import{enigmaDefinitions,MAIN_ENIGMA_COUNT}from'../src/data/enigmas'

const safe=(id='box-01')=>({id,title:'Enigma de teste',codename:'TEST',category:'book',difficulty:'easy',briefing:'Contexto público suficiente.',objective:'Descobrir o identificador solicitado.',question:'Qual identificador as evidências indicam?',evidence:[],hintCount:3,hints:[]})

describe('public enigma content boundary',()=>{
 it('accepts complete objective and primary question',()=>expect(parseCanonicalEnigmaPublicContent(safe(),'box-01')).toMatchObject({objective:safe().objective,question:safe().question}))
 it.each(['objective','question','briefing'])('rejects content missing %s',field=>expect(parseCanonicalEnigmaPublicContent({...safe(),[field]:''},'box-01')).toBeNull())
 it.each(['answer','acceptedAnswers','canonicalAnswer','secretTriggers','validatorLogic'])('rejects forbidden public field %s',field=>expect(parseCanonicalEnigmaPublicContent({...safe(),[field]:'SENSITIVE'},'box-01')).toBeNull())
 it('rejects content for a different resource id',()=>expect(parseCanonicalEnigmaPublicContent(safe('box-02'),'box-01')).toBeNull())
 it('keeps all 12 registry entries spoiler-free and externally validated',()=>{expect(MAIN_ENIGMA_COUNT).toBe(12);for(const item of enigmaDefinitions){expect(item.title).toBeTruthy();expect(item.briefing).toBeTruthy();expect(item.evidence?.length).toBeGreaterThan(0);expect(item.validatorId).toBe('external-canonical-v1');const serialized=JSON.stringify(item).toLowerCase();for(const key of['canonicalanswer','acceptedanswers','secret trigger'])expect(serialized).not.toContain(key)}})
})

describe('revealed hint boundary',()=>{it('accepts one requested safe hint',()=>expect(parseRevealedCanonicalHint({index:1,label:'PISTA 01',text:'Safe hint'},1)).toMatchObject({index:1,text:'Safe hint'}));it.each(['answer','alternatives','canonicalAnswer','solution','secretTrigger','validator'])('rejects leaked field %s',field=>expect(parseRevealedCanonicalHint({index:1,label:'PISTA 01',text:'Safe hint',[field]:'LEAK'},1)).toBeNull());it('rejects a different hint index',()=>expect(parseRevealedCanonicalHint({index:2,label:'PISTA 02',text:'Safe hint'},1)).toBeNull())})
