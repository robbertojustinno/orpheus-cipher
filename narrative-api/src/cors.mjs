export function corsHeaders(origin, allowedOrigins) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  }
  if (origin && allowedOrigins.has(origin)) {
    headers['access-control-allow-origin'] = origin
    headers.vary = 'Origin'
  }
  return headers
}

export function isAllowedOrigin(origin, allowedOrigins) {
  return Boolean(origin && allowedOrigins.has(origin))
}
