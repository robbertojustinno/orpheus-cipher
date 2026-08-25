# CIPHER Reward API — Render deployment

This service contains no canonical enigma answers, hints, secret triggers, or narrative files.

## Required environment

- `NODE_ENV=production`
- `DATABASE_URL`
- `ADMIN_EMAIL`
- `EMAIL_FROM`
- `RESEND_API_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH` in `scrypt$<salt-hex>$<hash-hex>` format
- `SESSION_SECRET` (minimum 32 random bytes)
- `ORPHEUS_ALLOWED_ORIGINS` (comma-separated Tauri and Render admin origins)
- `ADMIN_BASE_URL`

Generate an admin password hash locally without printing the password:

```powershell
$env:ADMIN_PASSWORD='temporary-value-from-secure-prompt'
node scripts/hash-admin-password.mjs
Remove-Item Env:ADMIN_PASSWORD
```

## Render

Use the root `render.yaml` Blueprint or create a PostgreSQL database and Node Web Service in the same region. The pre-deploy command runs `npm run migrate`; the service starts with `npm start` and listens on `0.0.0.0:$PORT`.

After deploy:

1. Verify `GET /health`.
2. Build the EXE with `VITE_ORPHEUS_API_ENDPOINT=https://<service>.onrender.com`.
3. Perform a physical test claim using an authorized test license.
4. Confirm the row in PostgreSQL and notification in Resend.
5. Authenticate at `/admin/rewards`, update status, carrier and tracking.
6. Export CSV and delete any test PII according to the operational policy.
