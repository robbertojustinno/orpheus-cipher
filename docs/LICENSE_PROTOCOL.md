# ORPHEUS License Protocol

ORPHEUS licenses use an Ed25519 signature envelope: `ORPHEUS1.base64url(payload-json).base64url(signature)`.

The application contains only the Ed25519 public verification key and key identifier. License creation requires the private key, which is maintained outside this public repository and never shipped in installers.

The signed payload covers license ID, type, immutable Founder number, issue/expiry dates, status, capabilities, key ID, activation policy and offline grace. Editing any field invalidates the signature. Founder numbers are restricted to 1–30; MASTER and STANDARD never carry a Founder number.

Activation verifies the token in the Rust backend and stores the verified envelope in `orpheus-license.json` under the application data directory. An installation UUID is generated locally; hardware serials, MAC addresses and TPM secrets are not collected.

The offline provider supports signed local validation and configurable grace metadata. Global concurrent-installation enforcement, recovery and near-real-time revocation require an authorized activation service. `ProductionLicenseProvider` is the boundary for that service and never falls back to unrestricted access.

Tokens contain `keyId` and signed `status`. Key rotation adds a new trusted public key identifier and retires the compromised issuer through the activation service. Founder numbers are historical identities and are not automatically recycled. Private issuance tooling and generated keys are intentionally absent from this repository.
