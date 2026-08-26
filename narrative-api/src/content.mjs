const categories = [
  'BOOK / NARRATIVE', 'CIPHER / BOOK', 'BOOK / ANALYSIS', 'NARRATIVE / HYBRID',
  'LOGIC / NARRATIVE', 'BOOK / PATTERN', 'CIPHER / ANALYSIS', 'NARRATIVE / TEMPORAL',
  'BOOK / IDENTITY', 'NARRATIVE / ANALYSIS', 'HYBRID / CIPHER', 'BOOK / CONVERGENCE',
]
const titles = ['A Caixa', 'CIPHER', 'Evelyn', 'Orpheus', 'Fragmento', 'Seis Cordas', 'Credencial', 'Mirror', 'Glasshouse', 'Terceiro Fator', 'Protocolo', 'Última Chave']
const difficulties = ['EASY', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'HARD', 'HARD', 'HARD', 'HARD', 'HARD', 'CLASSIFIED', 'CLASSIFIED']
const objectives = [
  'Identifique a sequência de sete caracteres registrada na superfície da caixa.',
  'Determine a quantidade associada à travessia descrita no registro.',
  'Identifique a função de autenticação que permaneceu sob a guarda de Evelyn.',
  'Localize o fragmento de recuperação que identifica diretamente o operador.',
  'Determine os três fatores ativos e preserve a ordem usada pelo sistema.',
  'Identifique o padrão transmitido pela alteração e correção da afinação.',
  'Identifique a credencial que autoriza a camada antiga.',
  'Identifique o intervalo entre a sincronização decisiva e a janela de manutenção.',
  'Identifique quem executou o teste registrado sob o perfil CIPHER.',
  'Identifique a voz sem perfil no ORPHEUS que rompeu o dilema previsto.',
  'Determine o elemento que deve ser eliminado para preservar as provas sem permitir reativação.',
  'Recupere a declaração final que redefine o significado de CIPHER.',
]

export function publicEnigma(raw, index) {
  const id = raw.id
  const hintCount = Array.isArray(raw.hints) ? raw.hints.length : 0
  return {
    id,
    title: titles[index] || id,
    category: categories[index] || 'NARRATIVE',
    difficulty: difficulties[index] || 'CLASSIFIED',
    briefing: raw.briefing,
    objective: objectives[index] || raw.question,
    question: raw.question,
    evidence: [
      { id: `${id}-evidence-01`, type: 'document', title: 'FRAGMENTO AUTORIZADO', contentRef: 'Consulte o evento indicado pelo enigma.', initiallyAvailable: true },
      { id: `${id}-evidence-02`, type: 'metadata', title: 'METADADOS CORRELACIONADOS', contentRef: 'Correlacione a pergunta com o material autorizado.', initiallyAvailable: true },
      { id: `${id}-evidence-03`, type: 'terminal', title: 'REGISTRO CIPHER', contentRef: '', initiallyAvailable: false },
    ],
    hintCount,
    hints: Array.from({ length: hintCount }, (_, i) => ({ index: i + 1, label: `PISTA ${String(i + 1).padStart(2, '0')}`, available: false })),
  }
}

export function createCatalog(canonical) {
  if (!canonical || !Array.isArray(canonical.enigmas) || canonical.enigmas.length !== 12) throw new Error('CANONICAL_CONTENT_INVALID')
  const map = new Map()
  canonical.enigmas.forEach((item, index) => {
    if (!/^box-\d{2}$/.test(item.id) || typeof item.question !== 'string' || !Array.isArray(item.hints)) throw new Error('CANONICAL_CONTENT_INVALID')
    map.set(item.id, { raw: item, public: publicEnigma(item, index) })
  })
  return map
}
