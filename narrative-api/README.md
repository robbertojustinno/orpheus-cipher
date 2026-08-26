# cipher-narrative-api

Production-only Narrative API for ORPHEUS. The service code contains no canonical answers or secret triggers. It loads both private JSON files at startup and fails closed if either file is unavailable.

## Local development

Set these variables to the private files outside this repository:

```powershell
$env:ORPHEUS_CANONICAL_ENIGMAS_FILE='C:\livro\Cipher\PRIVATE\narrative-phase8\canonical-enigmas.json'
$env:ORPHEUS_SECRET_CAMPAIGN_FILE='C:\livro\Cipher\PRIVATE\narrative-phase8\secret-campaign.json'
$env:ORPHEUS_NARRATIVE_ALLOWED_ORIGINS='http://tauri.localhost,https://tauri.localhost,http://localhost:1420,http://127.0.0.1:1420'
npm start
```

## Render setup

In the `cipher-narrative-api` service, create two Render Secret Files. Upload the existing private files without committing or pasting their contents into Git:

- Secret file name: `canonical-enigmas.json`; mount path: `/etc/secrets/canonical-enigmas.json`.
- Secret file name: `secret-campaign.json`; mount path: `/etc/secrets/secret-campaign.json`.

Set the service environment variables to those exact paths:

- `ORPHEUS_CANONICAL_ENIGMAS_FILE=/etc/secrets/canonical-enigmas.json`
- `ORPHEUS_SECRET_CAMPAIGN_FILE=/etc/secrets/secret-campaign.json`
- `ORPHEUS_NARRATIVE_ALLOWED_ORIGINS=http://tauri.localhost,https://tauri.localhost`
- `NODE_ENV=production`

The health check is valid only when both files have loaded: `GET /health` returns `{"status":"ok"}`. Never set an origin wildcard.

## Public contract

- `GET /v1/enigmas/:id/content`
- `POST /v1/enigmas/:id/hints/reveal`
- `POST /v1/enigmas/validate`
- `POST /v1/secrets/validate`

Responses are filtered and never include canonical answers, aliases, normalized answers, or secret triggers.
