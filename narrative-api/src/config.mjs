import process from 'node:process'

export const config = {
  port: Number(process.env.PORT || 47831),
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  enigmasFile: process.env.ORPHEUS_CANONICAL_ENIGMAS_FILE,
  secretsFile: process.env.ORPHEUS_SECRET_CAMPAIGN_FILE,
  origins: new Set((process.env.ORPHEUS_NARRATIVE_ALLOWED_ORIGINS || '')
    .split(',').map((value) => value.trim()).filter(Boolean)),
  rateLimit: Number(process.env.ORPHEUS_NARRATIVE_RATE_LIMIT || 90),
  rateWindowMs: Number(process.env.ORPHEUS_NARRATIVE_RATE_WINDOW_MS || 60_000),
}

export function resolveRequiredPath(value, name) {
  if (!value) throw new Error(`${name}_NOT_CONFIGURED`)
  return value
}
