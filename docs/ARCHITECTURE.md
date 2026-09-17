# ORPHEUS Architecture

## Phase 3 — Interactive Terminal

The terminal is an internal ORPHEUS command environment. It is not an operating-system shell.

```text
ActivityTerminal
  → useTerminalController
  → commandParser
  → commandRegistry / secretCommandRegistry
  → commandExecutor
  → typed TerminalAction
  → existing App actions and narrativeStore
```

### Command boundaries

- `commandParser.ts` tokenizes whitespace, quoted strings, command names and arguments.
- `commandRegistry.ts` is the explicit allowlist of executable public commands and aliases.
- `secretCommands.ts` provides a separate hidden registry. It is intentionally empty until the final manuscript is validated.
- `commandExecutor.ts` resolves only registered commands. Unknown text returns a controlled response.
- `useTerminalController.ts` owns session-only input/history and translates results into terminal output and typed UI actions.

No input is passed to CMD, PowerShell, Bash, process spawning, `eval`, or external network tools.

### State ownership

Identity, narrative state, enigmas, discovered commands and audit events remain owned by `narrativeStore`. Normal terminal history is session-only. Relevant audit events are persisted through the same Tauri Store adapter used in Phase 2.

### UI integration

Commands emit typed actions such as `open-enigma`, `prepare-search`, `open-dossier`, `navigate`, and `highlight-objective`. The application resolves these through the same modal and navigation handlers used by direct UI interaction.

## Phase 4 — Enigma Engine

```text
EnigmaWorkspace / terminal actions
  → enigmaEngine
  → EnigmaValidator provider
  → HintEngine / ProgressionEngine
  → UnlockEngine
  → narrativeStore
  → native persistence + narrative events
```

Definitions contain public metadata, placeholder evidence references, hint policy, prerequisites and typed unlock effects. State contains status, progress, attempts, unlocked hint identifiers and solution timestamp. Entered answers never become part of persisted state.

## Final narrative campaign

The public campaign registry contains 12 ordered main definitions and spoiler-safe descriptors. Canonical briefing, question, evidence and hints are loaded from the configured narrative endpoint. Answer validation posts only the candidate, enigma ID and minimal license context; the client receives a feedback code and never receives the canonical answer.

Narrative schema v2 adds campaign start/completion timestamps, classified discoveries and badges while migrating Phase 7 saves. Main progress excludes optional secret discoveries. Founder content is bonus-only and allocated by signed license number without blocking the main operation.

The private reference validator and canonical manuscript map are maintained outside this repository. Production requires a hardened HTTPS deployment with license-token verification, throttling and operational logging that never records submitted answers.

`LocalDevelopmentValidator` is restricted to DEV with visibly fictitious test values. `ProductionValidator` deliberately returns `VALIDATOR_UNAVAILABLE` until an external validation service is designed. Founder ranges and non-linear prerequisite arrays are represented without introducing exclusive campaign content.

## Phase 5 — Deep Search

```text
DeepSearchPanel / terminal actions
  → target detection + Query Planner
  → provider registry
  → timeout / cancellation / result limits
  → normalization + deduplication
  → initial correlation
  → result filters / OSINT investigation map / export
```

Providers are independent adapters with explicit status. Public RDAP is enabled for domain targets. General web, document and username adapters expose configuration points but remain unavailable until an authorized backend exists. Development data is compiled only in DEV.

Search history uses `orpheus-search.json`, separate from `orpheus-state.json`. Private searches are retained only in memory. The current Store is intentionally capped at 20 sessions and 100 results per deep search; a future SQLite layer can replace the adapter without changing the engine.

## Phase 6 — Investigation Graph

`SearchSession` flows through conservative entity extraction, evidence, deterministic confidence scoring, explainable relationships, timeline, bounded graph, operator review and reports. Investigation data uses the separate versioned `orpheus-investigations.json`, capped at 10 investigations, 500 entities and 1,000 relationships. Private sessions bypass persistence.

This bounded volume does not yet justify SQLite; the storage adapter remains the migration boundary. The graph is native SVG. Exact typed values may merge, but name similarity never merges people automatically. DNS enrichment runs through Hickory Resolver in the Rust backend after domain validation, without an operating-system shell.

## Phase 7 — Founders Licensing

Application access is gated before the narrative sequence. `LicenseProvider` separates production signature verification from the DEV-only provider. The Rust backend verifies Ed25519 envelopes; `useLicense` hydrates the isolated `orpheus-license.json` store, revalidates on startup and exposes typed capabilities. MASTER controls require both a verified MASTER identity and the relevant capability.

See [LICENSE_PROTOCOL.md](LICENSE_PROTOCOL.md) for the public protocol. Private issuance material is never part of the application repository or installer.
