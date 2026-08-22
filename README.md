# ORPHEUS — Companion Experience

Aplicativo narrativo desenvolvido com React, Vite, TypeScript e Tauri 2. No desktop, o backend Rust fornece somente username, hostname, plataforma e arquitetura; no navegador, esses campos usam fallback seguro.

## Persistência narrativa

- Desktop Tauri: `@tauri-apps/plugin-store`, com `set()` e `save()` explícito.
- Web: fallback isolado em `localStorage`.
- Arquivo Windows: `%APPDATA%\com.cipher.orpheus\orpheus-state.json`.
- Chave persistida: `narrative`.
- Schema atual: versão `1`, normalizado por `migrateNarrativeState()`.

A inicialização carrega o save, obtém a identidade local, hidrata o store e somente então monta a sequência narrativa.

## Modo web

```powershell
npm install
npm run dev
```

O Vite normalmente disponibiliza `http://localhost:5173`. No navegador, username e hostname reais não são acessados.

## Modo desktop

Na máquina de desenvolvimento são necessários Node.js, Rust e Microsoft C++ Build Tools:

```powershell
npm install
npm run tauri:dev
```

O comprador não precisa dessas ferramentas para executar o instalador final.

## Build

```powershell
npm run build
npm run tauri:build
```

Artefatos:

- `src-tauri/target/release/bundle/nsis/ORPHEUS_0.2.0_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/ORPHEUS_0.2.0_x64_en-US.msi`

## Testes

```powershell
npm test
cargo test --manifest-path src-tauri/Cargo.toml
```

## Privacidade

Não há envio externo dos dados identificados. Identidade local e progresso narrativo são fontes separadas. O progresso usa o Store oficial no desktop e `localStorage` somente no modo web.

## Phase 3 — Interactive ORPHEUS Terminal

O Terminal de Atividade aceita comandos internos registrados pelo ORPHEUS, mantém histórico por sessão, autocomplete e integração com os módulos narrativos existentes.

O terminal não é CMD, PowerShell, Bash ou qualquer outro shell. A entrada nunca é encaminhada ao sistema operacional, a processos externos ou a avaliação dinâmica. Somente handlers presentes no command registry podem produzir ações controladas dentro do aplicativo.

Comandos narrativos secretos possuem uma infraestrutura separada e não aparecem no help, autocomplete ou documentação pública. Nenhum trigger dependente do livro foi definido nesta fase.

Detalhes adicionais:

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)
