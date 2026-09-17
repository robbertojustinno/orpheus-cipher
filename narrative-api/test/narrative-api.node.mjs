import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { once } from 'node:events'

const privateDir = 'C:/livro/Cipher/PRIVATE/narrative-phase8'
process.env.ORPHEUS_CANONICAL_ENIGMAS_FILE = `${privateDir}/canonical-enigmas.json`
process.env.ORPHEUS_SECRET_CAMPAIGN_FILE = `${privateDir}/secret-campaign.json`
process.env.ORPHEUS_NARRATIVE_ALLOWED_ORIGINS = 'http://tauri.localhost,https://tauri.localhost,http://localhost:1420,http://127.0.0.1:1420'
process.env.ORPHEUS_NARRATIVE_RATE_LIMIT = '1000'
process.env.PORT = '0'
const { createNarrativeServer } = await import('../src/server.mjs')
const server = createNarrativeServer().listen(0, '127.0.0.1')
await once(server, 'listening')
const base = `http://127.0.0.1:${server.address().port}`
const origin = 'http://tauri.localhost'
const get = (path) => fetch(`${base}${path}`, { headers: { Origin: origin } })
const post = (path, body) => fetch(`${base}${path}`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const serialized = (value) => JSON.stringify(value).toLowerCase()
const forbidden = ['answer', 'answers', 'aliases', 'canonicalanswer', 'normalizedanswer', 'expected', 'trigger', 'secrettrigger']

test.after(() => server.close())

test('health only reports ready after private data loads', async () => {
  const response = await get('/health')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
})

test('12/12 public contents exclude sensitive fields', async () => {
  for (let index = 1; index <= 12; index += 1) {
    const response = await get(`/v1/enigmas/box-${String(index).padStart(2, '0')}/content`)
    assert.equal(response.status, 200)
    const body = await response.json()
    assert.equal(body.id, `box-${String(index).padStart(2, '0')}`)
    assert.equal(typeof body.question, 'string')
    for (const field of forbidden) assert.equal(Object.hasOwn(body, field), false, `${body.id} leaked ${field}`)
    assert.equal(forbidden.some((field) => serialized(body).includes(`"${field}"`)), false)
  }
})

test('36/36 hints reveal only the requested hint', async () => {
  for (let enigma = 1; enigma <= 12; enigma += 1) {
    const id = `box-${String(enigma).padStart(2, '0')}`
    for (let hint = 1; hint <= 3; hint += 1) {
      const response = await post(`/v1/enigmas/${id}/hints/reveal`, { hintIndex: hint })
      assert.equal(response.status, 200)
      const body = await response.json()
      assert.equal(body.index, hint)
      assert.equal(Object.hasOwn(body, 'answer'), false)
      assert.equal(Object.hasOwn(body, 'hints'), false)
    }
  }
})

test('12/12 answers and aliases validate without exposing the answer', async () => {
  const canonical = JSON.parse(await readFile(`${privateDir}/canonical-enigmas.json`, 'utf8'))
  for (const item of canonical.enigmas) {
    for (const answer of [item.answer, ...(item.alternatives || [])]) {
      const response = await post('/v1/enigmas/validate', { enigmaId: item.id, answer })
      assert.equal(response.status, 200)
      assert.equal((await response.json()).feedbackCode, 'CORRECT')
    }
    const wrong = await post('/v1/enigmas/validate', { enigmaId: item.id, answer: '__wrong__' })
    assert.equal((await wrong.json()).feedbackCode, 'INCORRECT')
  }
})

test('4/4 secrets validate with safe responses', async () => {
  const campaign = JSON.parse(await readFile(`${privateDir}/secret-campaign.json`, 'utf8'))
  for (const item of campaign.secretEnigmas) {
    const response = await post('/v1/secrets/validate', { input: item.trigger })
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.discovered, true)
    assert.equal(Object.hasOwn(body, 'trigger'), false)
  }
  const invalid = await post('/v1/secrets/validate', { input: '__wrong__' })
  assert.deepEqual(await invalid.json(), { discovered: false })
})

test('CORS allows Tauri and denies unknown origins', async () => {
  const preflight = await fetch(`${base}/v1/enigmas/box-01/content`, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' } })
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin)
  const denied = await fetch(`${base}/v1/enigmas/box-01/content`, { headers: { Origin: 'https://evil.example' } })
  assert.equal(denied.status, 403)
  assert.equal((await denied.json()).code, 'ORIGIN_DENIED')
})
