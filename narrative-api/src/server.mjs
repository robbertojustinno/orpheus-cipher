import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { config, resolveRequiredPath } from './config.mjs'
import { createCatalog } from './content.mjs'
import { normalize, validateAnswer, validateSecret } from './validator.mjs'
import { corsHeaders, isAllowedOrigin } from './cors.mjs'

let state
let startupError
try {
  const enigmasFile = resolveRequiredPath(config.enigmasFile, 'CANONICAL_CONTENT')
  const secretsFile = resolveRequiredPath(config.secretsFile, 'SECRET_CAMPAIGN')
  const [enigmasText, secretsText] = await Promise.all([readFile(enigmasFile, 'utf8'), readFile(secretsFile, 'utf8')])
  state = { catalog: createCatalog(JSON.parse(enigmasText)), secrets: JSON.parse(secretsText) }
} catch (error) {
  startupError = error instanceof Error ? error.message : 'CANONICAL_CONTENT_NOT_AVAILABLE'
  console.error('CANONICAL_CONTENT_NOT_AVAILABLE')
}

const buckets = new Map()
function rateLimited(request, route) {
  const key = `${request.socket.remoteAddress || 'unknown'}:${route}`
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || now - current.start >= config.rateWindowMs) {
    buckets.set(key, { start: now, count: 1 })
    return false
  }
  current.count += 1
  return current.count > config.rateLimit
}

function writeJson(request, response, status, payload, requestId) {
  response.writeHead(status, { ...corsHeaders(request.headers.origin, config.origins), 'x-request-id': requestId })
  response.end(JSON.stringify(payload))
}

async function readBody(request) {
  let total = 0
  const chunks = []
  for await (const chunk of request) {
    total += chunk.length
    if (total > 32_000) throw new Error('BODY_TOO_LARGE')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function routeId(pathname) {
  const match = /^\/v1\/enigmas\/((?:box-)?\d{2})\//.exec(pathname)
  return match ? (match[1].startsWith('box-') ? match[1] : `box-${match[1]}`) : null
}

export function createNarrativeServer() {
  return createServer(async (request, response) => {
    const requestId = randomUUID()
    const started = performance.now()
    const origin = request.headers.origin
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1')
      if (request.method === 'OPTIONS') {
        if (!isAllowedOrigin(origin, config.origins)) return writeJson(request, response, 403, { code: 'ORIGIN_DENIED' }, requestId)
        response.writeHead(204, {
          ...corsHeaders(origin, config.origins),
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': 'content-type, authorization, idempotency-key',
          'access-control-max-age': '600',
          'x-request-id': requestId,
        })
        return response.end()
      }
      if (origin && !isAllowedOrigin(origin, config.origins)) return writeJson(request, response, 403, { code: 'ORIGIN_DENIED' }, requestId)
      if (url.pathname === '/health' && request.method === 'GET') {
        return startupError ? writeJson(request, response, 503, { status: 'error', code: 'CANONICAL_CONTENT_NOT_AVAILABLE' }, requestId) : writeJson(request, response, 200, { status: 'ok' }, requestId)
      }
      if (startupError) return writeJson(request, response, 503, { code: 'CANONICAL_CONTENT_NOT_AVAILABLE' }, requestId)

      const id = routeId(url.pathname)
      if (request.method === 'GET' && id && url.pathname.endsWith('/content')) {
        const entry = state.catalog.get(id)
        return entry ? writeJson(request, response, 200, entry.public, requestId) : writeJson(request, response, 404, { code: 'NOT_FOUND' }, requestId)
      }
      if (request.method === 'POST' && id && url.pathname.endsWith('/hints/reveal')) {
        if (rateLimited(request, 'hint')) return writeJson(request, response, 429, { code: 'RATE_LIMITED' }, requestId)
        const input = await readBody(request)
        const entry = state.catalog.get(id)
        const index = Number(input.hintIndex)
        if (!entry || !Number.isInteger(index) || index < 1 || index > entry.raw.hints.length) return writeJson(request, response, entry ? 422 : 404, { code: entry ? 'INVALID_HINT_INDEX' : 'NOT_FOUND' }, requestId)
        return writeJson(request, response, 200, { index, label: `PISTA ${String(index).padStart(2, '0')}`, text: entry.raw.hints[index - 1] }, requestId)
      }
      if (request.method === 'POST' && url.pathname === '/v1/enigmas/validate') {
        if (rateLimited(request, 'validate')) return writeJson(request, response, 429, { code: 'RATE_LIMITED' }, requestId)
        const input = await readBody(request)
        const idValue = typeof input.enigmaId === 'string' ? input.enigmaId : input.id
        const idKey = typeof idValue === 'string' && /^\d{2}$/.test(idValue) ? `box-${idValue}` : idValue
        const entry = state.catalog.get(idKey)
        const feedbackCode = validateAnswer(entry?.raw, input.answer)
        return writeJson(request, response, 200, { feedbackCode }, requestId)
      }
      if (request.method === 'POST' && url.pathname === '/v1/secrets/validate') {
        if (rateLimited(request, 'secret')) return writeJson(request, response, 429, { code: 'RATE_LIMITED' }, requestId)
        const input = await readBody(request)
        return writeJson(request, response, 200, validateSecret(state.secrets, input.input), requestId)
      }
      return writeJson(request, response, 404, { code: 'NOT_FOUND' }, requestId)
    } catch {
      return writeJson(request, response, 400, { code: 'INVALID_REQUEST' }, requestId)
    } finally {
      const latency = Math.round(performance.now() - started)
      console.info(`${request.method} ${request.url} ${response.statusCode || 500} ${latency}ms ${requestId}`)
    }
  })
}

if (process.argv[1] && process.argv[1].endsWith('server.mjs')) {
  const server = createNarrativeServer()
  server.listen(config.port, config.host, () => console.info(`cipher-narrative-api listening on ${config.host}:${config.port}`))
}
