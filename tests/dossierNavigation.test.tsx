import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ModulePanel } from '../src/features/modules/ModulePanel'

describe('dossier navigation', () => {
  it('wires the dossier button to the existing callback', () => {
    const source = readFileSync(new URL('../src/components/AlertPanel.tsx', import.meta.url), 'utf8')
    expect(source).toMatch(/<button onClick=\{onDossier\}>VER DOSSI/)
    expect(readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')).toMatch(/setActive\([^)]*Dossi/)
  })

  it.each(['blake', 'evelyn', 'gordon', 'cipher', 'orpheus'])('renders selected dossier %s', (subject) => {
    const html = renderToStaticMarkup(<ModulePanel module="dossier" subject={subject} onBack={() => undefined} />)
    expect(html).toContain(subject.toUpperCase())
    expect(html).toContain('PERFIL:')
    expect(html).toContain('VOLTAR')
  })
})
