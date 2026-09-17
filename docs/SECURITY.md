# Security

## Terminal threat model

The ORPHEUS terminal is a deterministic application command parser, not a system terminal. Only names registered in `commandRegistry.ts` or the private secret registry can execute application handlers.

The following capabilities are deliberately absent:

- shell invocation;
- arbitrary process spawning;
- `eval` or dynamic code execution;
- forwarding commands to CMD, PowerShell, Bash or SH;
- automatic `curl`, `wget` or external search execution;
- access to passwords, tokens, browser data, documents or personal files.

Inputs such as `powershell Get-ChildItem`, `cmd /c dir`, `bash`, `sh`, `curl` and `wget` return `COMMAND NOT RECOGNIZED` and produce no external action.

## Audit data

Audit records contain only event type, timestamp and an application resource identifier. Raw command arguments and sensitive operating-system data are not written to the audit trail.

Answers submitted through the workspace or `answer` command are transient. Terminal history displays `[REDACTED]`, audit records contain only the enigma identifier, and no answer is placed in native persistence or production console output.

## Public repository boundary

The repository contains engine code and spoiler-safe public descriptors only. It must not contain canonical answers, book spoilers, secret triggers, premium content, personal saves or credentials. Production builds do not contain the DEV validator table, DEV panel or development OSINT provider. Short canonical answers are validated outside the distributed frontend; local hashes are not treated as adequate secrecy.

The canonical endpoint must use HTTPS, verify an authorized signed-license proof server-side, rate-limit attempts, reject oversized input and return only `CORRECT`, `INCORRECT`, `PARTIAL` or `INVALID_FORMAT`. Candidate answers must not be persisted in application state, audit events, analytics or production logs.

Share cards omit hostname and machine identifiers. Operation reports contain operator display name only by explicit export action and never include answers, license tokens or secret triggers.

## Secret commands

Secret commands are excluded from public help, autocomplete and README output. No book-dependent triggers are defined until they can be checked against the final manuscript.

## OSINT boundaries

- only public, indexed or explicitly authorized sources;
- no scraping bypass, authentication, exploitation or remote shell;
- only `http` and `https` URLs may open in the system browser;
- credential-oriented dorks are blocked and absent from the public template library;
- no API key is embedded in the frontend;
- failures and rate limits are isolated per provider;
- searches marked private are never written to search history;
- OSINT exports contain only the selected search session, never narrative state.

The Tauri opener capability is scoped to HTTP/HTTPS. Results are not loaded inside the application WebView.

## Investigation privacy and DNS

- Investigations persist only in the application data directory as `orpheus-investigations.json`.
- Private searches and derived graphs, evidence, notes and hypotheses remain memory-only.
- Deletion targets only the selected investigation; exports exclude narrative state and enigma answers.
- Confidence is deterministic, evidence-backed and explicitly non-conclusive.
- DNS accepts validated domain names only and queries public A, AAAA, MX, NS, CNAME and TXT records through an in-process Rust resolver.
- No `nslookup`, `dig`, PowerShell, CMD, process spawning or arbitrary network argument is used.

## License trust boundary

- Ed25519 verification occurs in Rust using a public key only.
- The issuer private key and real activation tokens are absent from source, Git history and installers.
- Signed fields include type, Founder number, status and capabilities; tampering fails verification.
- MASTER UI and reset actions require signed MASTER type plus explicit capabilities.
- The installation ID is a random local UUID, not a hardware fingerprint.
- The DEV provider is selected only through `import.meta.env.DEV`; production builds are scanned to ensure its credential string is absent.
- Editing `orpheus-license.json` cannot manufacture a valid signed token.
