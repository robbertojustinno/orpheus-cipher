import { describe, expect, it } from 'vitest'
import { getOperationalFileDetail, getOperationalMessageDetail } from '../src/features/modules/operationalContent'
import { readFileSync } from 'node:fs'

describe('operational modules',()=>{
 it('maps an unlocked file to existing public enigma metadata without answers',()=>{
  const detail=getOperationalFileDetail('operation-fragment-01')
  expect(detail.source).toContain('Enigma 01')
  expect(detail.summary).toContain('primeira peça')
  expect(JSON.stringify(detail).toLowerCase()).not.toContain('answer')
 })
 it('maps an unlocked message to its existing progression source without inventing dialogue',()=>{
  const detail=getOperationalMessageDetail('cipher-message-01')
  expect(detail.source).toContain('Enigma 03')
  expect(detail.note).toContain('Nenhum diálogo')
 })
 it('renders operational items as explicit open actions and provides export status',()=>{
  const source=readFileSync(new URL('../src/features/modules/OperationalPanel.tsx',import.meta.url),'utf8')
  expect(source).toContain('ABRIR')
  expect(source).toContain('VOLTAR À LISTA')
  expect(source).toContain('FALHA AO SALVAR')
 })
 it('uses a native Tauri export command with a browser fallback',()=>{
  const source=readFileSync(new URL('../src/features/narrative/operationReport.ts',import.meta.url),'utf8')
  expect(source).toContain("invoke<string>('save_export_file'")
  expect(source).toContain('browserDownload')
 })
})
