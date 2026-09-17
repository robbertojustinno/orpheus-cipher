import type { NarrativeProgress } from '../../types'
import styles from './CompletionPanel.module.css'
import { exportOperationReport,exportShareCard } from './operationReport'

export function CompletionPanel({progress,onClose}:{progress:NarrativeProgress;onClose:()=>void}){
 const solved=Object.values(progress.enigmas).filter(item=>item.status==='solved').length
 return <div className={styles.backdrop}><section className={styles.panel} role="dialog" aria-modal="true"><small>ORPHEUS // FINAL OPERATION</small><h2>FINAL KEY ACCEPTED</h2><h3>ORPHEUS CORE UNLOCKED</h3><div className={styles.sequence}><b>THREAT CONTAINED.</b><span>COMMAND AUTHORITY REVOKED.</span><span>EVIDENCE CHAIN PRESERVED.</span><b>NOT ALL NODES RESPONDED.</b></div><p>A operação principal foi concluída. O nome sobreviveu — e a rede ainda guarda zonas classificadas.</p><div className={styles.stats}><span><small>MAIN OPERATION</small><strong>{solved}/12</strong></span><span><small>CLASSIFIED DISCOVERY</small><strong>{progress.secretDiscoveries.length}</strong></span></div><button onClick={()=>{void exportOperationReport(progress)}}>EXPORTAR RELATÓRIO</button> <button onClick={()=>{void exportShareCard(progress)}}>CARTÃO SEM SPOILERS</button> <button onClick={onClose}>ARQUIVAR</button></section></div>
}
