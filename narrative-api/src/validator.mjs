export function normalize(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function validateAnswer(item, answer) {
  if (!item || typeof answer !== 'string') return 'INVALID_FORMAT'
  const candidate = normalize(answer)
  const accepted = [item.answer, ...(Array.isArray(item.alternatives) ? item.alternatives : [])]
    .filter((value) => typeof value === 'string').map(normalize)
  return accepted.includes(candidate) ? 'CORRECT' : 'INCORRECT'
}

export function validateSecret(campaign, input) {
  if (!campaign || typeof input !== 'string') return { discovered: false }
  const candidate = normalize(input)
  const secret = (campaign.secretEnigmas || []).find((item) => normalize(item.trigger) === candidate)
  return secret ? { discovered: true, id: secret.id, message: 'CLASSIFIED DISCOVERY REGISTERED.' } : { discovered: false }
}
