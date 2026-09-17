import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../src/components/Sidebar';

vi.mock('../src/components/Icon', () => ({ Icon: () => <span data-icon /> }));

describe('RC12 hotfix navigation', () => {
  it('exposes Distintivo in the main navigation only after campaign completion', () => {
    const hidden = renderToStaticMarkup(
      <Sidebar active="Painel" open onClose={vi.fn()} onNavigate={vi.fn()} />,
    );
    const visible = renderToStaticMarkup(
      <Sidebar
        active="Painel"
        open
        showBadge
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(hidden).not.toContain('Distintivo');
    expect(visible).toContain('Distintivo');
  });

  it('restores the final completion sequence only on a new completion transition', () => {
    const app = readFileSync(
      new URL('../src/App.tsx', import.meta.url),
      'utf8',
    );

    expect(app).toContain('completionObserved.current === null');
    expect(app).toContain('!completionObserved.current && progress.campaignCompleted');
    expect(app).toContain('setShowCompletion(true)');
  });

  it('keeps Distintivo as an explicit route instead of intercepting enigma selection', () => {
    const app = readFileSync(
      new URL('../src/App.tsx', import.meta.url),
      'utf8',
    );

    expect(app).toContain('active === "Distintivo"');
    expect(app).toContain('forceOpen={active === "Distintivo"}');
    expect(app).not.toContain('selected?.id === "box-12"');
  });

  it('makes the final report export controls functional', () => {
    const app = readFileSync(
      new URL('../src/App.tsx', import.meta.url),
      'utf8',
    );
    const operational = readFileSync(
      new URL('../src/features/modules/OperationalPanel.tsx', import.meta.url),
      'utf8',
    );

    expect(app).toContain('onExportReport={() => exportOperationReport(progress)}');
    expect(app).toContain('onExportCard={() => exportShareCard(progress)}');
    expect(operational).toContain('EXPORTAR RELATÓRIO');
    expect(operational).toContain('CARTÃO SEM SPOILERS');
  });
});
