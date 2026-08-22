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

`LocalDevelopmentValidator` is restricted to DEV with visibly fictitious test values. `ProductionValidator` deliberately returns `VALIDATOR_UNAVAILABLE` until an external validation service is designed. Founder ranges and non-linear prerequisite arrays are represented without introducing exclusive campaign content.
