import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SecretReward } from '../src/features/reward/SecretReward';
import type { LicenseIdentity } from '../src/features/license/types/license';
import type { RewardEligibility } from '../src/features/reward/rewardService';

const claim = (licenseLabel: string): RewardEligibility => ({
  eligible: true,
  rewardUnlocked: true,
  rewardClaimed: true,
  rewardType: 'digital',
  claim: {
    displayName: 'OPERADOR TESTE',
    licenseLabel,
    completedAt: '2026-08-25T12:00:00.000Z',
    claimedAt: '2026-08-25T12:01:00.000Z',
    verificationCode: 'CIPHER-OP-TESTCODE01',
    rewardType: 'digital',
  },
});

const license = (
  type: LicenseIdentity['type'],
  founderNumber?: number,
): LicenseIdentity => ({
  licenseId: `LIC-${type}`,
  type,
  founderNumber,
  issuedAt: '2026-01-01T00:00:00.000Z',
  status: 'active',
  capabilities: ['orpheus-core', 'narrative'],
  keyId: 'test-key',
  maxActivations: 1,
  offlineGraceDays: 30,
});

function badgeMarkup(
  type: LicenseIdentity['type'],
  label: string,
  founderNumber?: number,
) {
  return renderToStaticMarkup(
    <SecretReward
      eligibility={claim(label)}
      license={license(type, founderNumber)}
      busy={false}
      error=""
      onClaim={vi.fn()}
      onReturnToMain={vi.fn()}
    />,
  );
}

describe('reward badge navigation', () => {
  it.each([
    ['MASTER', 'MASTER ACCESS', undefined],
    ['FOUNDER', 'Founder 07/30', 7],
    ['STANDARD', 'STANDARD', undefined],
  ] as const)(
    'always renders a return control for %s claims',
    (type, label, founderNumber) => {
      const html = badgeMarkup(type, label, founderNumber);
      expect(html).toContain('OPERADOR VALIDADO');
      expect(html).toContain('CIPHER Verified');
      expect(html).toContain('cipher-verified-badge.png');
      expect(html).toContain('VOLTAR AO MENU PRINCIPAL');
      expect(html).toContain('data-testid="reward-return-main"');
      expect(html).toContain('CIPHER-OP-TESTCODE01');
      expect(html).toContain(label);
    },
  );

  it('keeps Escape local to the badge and removes the listener on unmount', () => {
    const source = readFileSync(
      new URL('../src/features/reward/SecretReward.tsx', import.meta.url),
      'utf8',
    );
    expect(source).toContain("if (stage !== 'badge') return");
    expect(source).toContain("if (event.key === 'Escape') onReturnToMain()");
    expect(source).toContain(
      "return () => window.removeEventListener('keydown', handleEscape)",
    );
  });

  it('reopens an existing badge without issuing a new claim', () => {
    const source = readFileSync(
      new URL('../src/features/reward/SecretReward.tsx', import.meta.url),
      'utf8',
    );
    expect(source).toMatch(/onClick=\{\(\) => setOpen\(true\)\}[\s\S]*VER DISTINTIVO/);
    expect(source).not.toMatch(/VER DISTINTIVO[\s\S]{0,100}reward\.claim/);
  });
});
