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

- `src-tauri/target/release/bundle/nsis/ORPHEUS_0.7.0_x64-setup.exe`
- `src-tauri/target/release/bundle/msi/ORPHEUS_0.7.0_x64_en-US.msi`

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

## Phase 4 — ORPHEUS Enigma Engine

As Caixas Enigmas usam uma engine desacoplada para tentativas, pistas progressivas, pré-requisitos, progresso ponderado e efeitos de desbloqueio. O workspace preserva o visual aprovado e apresenta briefing, evidências, pistas e validação como um arquivo classificado.

Este repositório contém somente a engine pública e placeholders explícitos. Respostas canônicas, spoilers e chaves narrativas não são armazenados no frontend. A build de produção usa um provider sem validação local; respostas fictícias e ferramentas de teste existem apenas no modo DEV e são removidas do bundle de produção.

## Phase 5 — Deep Search

Pesquisa Profunda oferece Quick Search, Deep Search e Deep Dorks com planner visível, providers desacoplados, deduplicação, correlação explicável, filtros, cancelamento, timeout e exportação JSON/CSV. Consultas manuais são abertas somente no navegador padrão. URLs fora de HTTP/HTTPS são bloqueadas.

O provider RDAP consulta informações públicas de domínio sem chave. Adapters de busca web, documentos e usernames permanecem indisponíveis até que um backend autorizado seja configurado; a produção nunca fabrica resultados. O provider fictício é restrito ao modo DEV e identificado como `DEV DATA`.

## Phase 6 — Investigation Graph

Resultados públicos podem ser estruturados em entidades, evidências, relações explicáveis, timeline e grafo. O score determinístico expõe seus sinais e não apresenta correlação como identidade comprovada. Revisões do operador preservam a evidência original e hipóteses são rotuladas como `OPERATOR HYPOTHESIS`.

DNS público é enriquecido no backend Rust sem shell. Investigações usam `orpheus-investigations.json`; modo privado fica somente em memória. Exports incluem JSON, CSV separados e relatório HTML offline.

## Phase 7 — Founders Licensing

O acesso completo é precedido por autorização de licença assinada Ed25519. Founders possuem números imutáveis entre `01/30` e `30/30`; MASTER é uma identidade técnica independente e protegida por capabilities. O aplicativo armazena somente o token assinado verificado em `orpheus-license.json` e um installation ID aleatório, sem fingerprint invasivo.

O protocolo público está em [License Protocol](docs/LICENSE_PROTOCOL.md). Chaves privadas e licenças reais não pertencem a este repositório.

Detalhes adicionais:

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Roadmap](docs/ROADMAP.md)
