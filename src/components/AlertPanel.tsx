import type { NarrativeState, OperatorIdentity } from '../types';
import { Icon } from './Icon';
import styles from './AlertPanel.module.css';
export function AlertPanel({
  onStart,
  onDossier,
  state,
  identity,
}: {
  onStart: () => void;
  onDossier: () => void;
  state: NarrativeState;
  identity: OperatorIdentity;
}) {
  const detected = state === 'DETECTED' || state === 'MISSION_ACTIVE';
  const restored = state === 'MISSION_ACTIVE';
  return (
    <section className={styles.panel}>
      <div className={styles.scan} />
      {detected && (
        <div className={styles.alertIcon}>
          <span>!</span>
          <i />
          <i />
          <i />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <span />{' '}
          {detected
            ? 'ALERTA DE SISTEMA // PRIORIDADE MÁXIMA'
            : 'ORPHEUS NETWORK // SESSÃO SEGURA'}
        </div>
        <h1>
          {restored
            ? 'SESSÃO RESTAURADA'
            : detected
              ? 'USUÁRIO DETECTADO'
              : 'MONITORAMENTO ATIVO'}
        </h1>
        <div className={styles.ids}>
          {detected ? (
            <>
              <span>
                Sistema vinculado ao host: <strong>{identity.hostname}</strong>
              </span>
              <span>
                Operador identificado: <strong>{identity.username}</strong>
              </span>
            </>
          ) : (
            <>
              <span>
                Integridade da sessão: <strong>ESTÁVEL</strong>
              </span>
              <span>
                Nó operacional: <strong>BR-SAO-09</strong>
              </span>
            </>
          )}
        </div>
        <p>
          {restored
            ? `Operador ${identity.username} conectado. O estado da missão foi recuperado. O ORPHEUS aguarda a continuidade da sequência.`
            : detected
              ? 'Você foi detectado pelo ORPHEUS. Esta sessão não deveria estar ativa. Uma sequência do Protocolo Orpheus foi iniciada e partes dos arquivos foram fragmentadas. Para proteger os que estão próximos e impedir a propagação do protocolo, será necessário recuperar os fragmentos e decifrar os enigmas.'
              : 'O sistema está operando dentro dos parâmetros esperados. Os módulos de inteligência permanecem disponíveis para consulta enquanto a sessão é monitorada.'}
        </p>
        <div className={styles.actions}>
          {state === 'DETECTED' && (
            <button onClick={onStart}>
              INICIAR SEQUÊNCIA <Icon name="arrow" size={16} />
            </button>
          )}
          <button onClick={onDossier}>VER DOSSIÊ</button>
        </div>
      </div>
      <div className={styles.radar}>
        <div className={styles.sweep} />
        <i />
        <i />
        <div>
          ORPHEUS<small>SCAN // 09</small>
        </div>
      </div>
      <div className={styles.coords}>
        23°33'S&nbsp; 46°38'W <span>LIVE</span>
      </div>
    </section>
  );
}
