import type { RewardClaim, RewardEligibility } from './rewardService';
import badgeImage from '../../assets/cipher-verified-badge.png';
import styles from './BadgeView.module.css';

const badgeAlt = 'CIPHER Verified \u2014 Operador Validado';
const completedLabel = 'REGISTRO DE OPERADOR J\u00c1 CONCLU\u00cdDO';
const licenseLabel = 'Licen\u00e7a';
const dateLabel = 'Opera\u00e7\u00e3o conclu\u00edda em';
const codeLabel = 'C\u00f3digo de verifica\u00e7\u00e3o';
const dialogProps = {
  role: 'dialog',
  'aria-modal': true,
  'aria-label': 'Operador validado',
} as const;

interface Props {
  eligibility: RewardEligibility;
  onReturnToMain: () => void;
}

function BadgeContent({
  claim,
  onReturnToMain,
}: {
  claim: RewardClaim;
  onReturnToMain: () => void;
}) {
  return (
    <div className={styles.backdrop}>
      <BadgePanel claim={claim} onReturnToMain={onReturnToMain} />
    </div>
  );
}

function BadgePanel({
  claim,
  onReturnToMain,
}: {
  claim: RewardClaim;
  onReturnToMain: () => void;
}) {
  return (
    <section {...dialogProps} className={`${styles.panel} ${styles.badge}`}>
      <BadgeIdentity claim={claim} />
      <BadgeButton onReturnToMain={onReturnToMain} />
    </section>
  );
}

function BadgeIdentity({ claim }: { claim: RewardClaim }) {
  return (
    <>
      <BadgeHeading />
      <BadgeRows claim={claim} />
    </>
  );
}

function BadgeHeading() {
  return (
    <>
      <small>{completedLabel}</small>
      <BadgeArtwork />
      <h2>OPERADOR VALIDADO</h2>
    </>
  );
}

function BadgeArtwork() {
  return <img className={styles.badgeImage} src={badgeImage} alt={badgeAlt} />;
}

function BadgeRows({ claim }: { claim: RewardClaim }) {
  return (
    <>
      <BadgeRow label={'Nome'} value={claim.displayName} />
      <BadgeRow label={licenseLabel} value={claim.licenseLabel} />
      <BadgeDates claim={claim} />
    </>
  );
}

function BadgeRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span>{label}</span>
      <strong>{value}</strong>
    </p>
  );
}

function BadgeDates({ claim }: { claim: RewardClaim }) {
  const completedAt = new Date(claim.completedAt).toLocaleString('pt-BR');
  return (
    <>
      <BadgeRow label={dateLabel} value={completedAt} />
      <BadgeCode claim={claim} />
    </>
  );
}

function BadgeCode({ claim }: { claim: RewardClaim }) {
  return (
    <p>
      <span>{codeLabel}</span>
      <code>{claim.verificationCode}</code>
    </p>
  );
}

function BadgeButton({ onReturnToMain }: { onReturnToMain: () => void }) {
  return (
    <button
      className={styles.returnButton}
      data-testid={'reward-return-main'}
      onClick={onReturnToMain}
    >
      VOLTAR AO MENU PRINCIPAL
    </button>
  );
}

export function BadgeView({ eligibility, onReturnToMain }: Props) {
  const claim = eligibility.claim!;
  return <BadgeContent claim={claim} onReturnToMain={onReturnToMain} />;
}
