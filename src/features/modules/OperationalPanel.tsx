import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import type { ExportResult } from "../narrative/operationReport";
import styles from "./ModulePanel.module.css";
import { getOperationalFileDetail, getOperationalMessageDetail, type OperationalRecordDetail } from "./operationalContent";

export type OperationalModule = "files" | "messages" | "missions" | "report";

const dossierDetails: Record<string, { title: string; classification: string; status: string; identity: string; profile: string; records: string }> = {
  blake: { title: "BLAKE LANGMERE", classification: "AUTHORIZED RECORD", status: "ACTIVE RECORD", identity: "BLAKE LANGMERE", profile: "Registro público do sujeito associado à primeira peça narrativa. Detalhes biográficos adicionais permanecem classificados.", records: "A CAIXA // FRAGMENTOS AUTORIZADOS" },
  evelyn: { title: "EVELYN CROSS", classification: "AUTHORIZED RECORD", status: "ACTIVE RECORD", identity: "EVELYN CROSS", profile: "Registro narrativo de Evelyn Cross. A função operacional é referenciada no material autorizado; demais identificadores permanecem classificados.", records: "EVELYN // REGISTROS AUTORIZADOS" },
  gordon: { title: "GORDON SULLIVAN", classification: "LIMITED RECORD", status: "DATA UNAVAILABLE", identity: "GORDON SULLIVAN", profile: "O índice reconhece este sujeito, mas não há perfil público adicional autorizado nesta instalação.", records: "NENHUM REGISTRO ADICIONAL AUTORIZADO" },
  cipher: { title: "CIPHER", classification: "CLASSIFIED ENTITY", status: "MONITORED", identity: "CIPHER", profile: "Identidade operacional referenciada pelo protocolo CIPHER. Revelações dependentes da progressão permanecem protegidas.", records: "CIPHER // REGISTROS DE OPERAÇÃO" },
  orpheus: { title: "ORPHEUS", classification: "SYSTEM RECORD", status: "ACTIVE", identity: "ORPHEUS", profile: "Protocolo de operação e preservação de evidências desta instalação. Infraestrutura privada e conteúdo secreto não são exibidos.", records: "PROTOCOLO ORPHEUS // REGISTROS AUTORIZADOS" },
};

export function DossierDetail({ subject, onBack }: { subject: string; onBack: () => void }) {
  const detail = dossierDetails[subject] ?? { title: subject.toUpperCase(), classification: "CLASSIFIED", status: "DATA UNAVAILABLE", identity: subject.toUpperCase(), profile: "Nenhum registro autorizado foi encontrado para este sujeito.", records: "NENHUM REGISTRO DISPONÍVEL" };
  return <div className={styles.result} data-testid="dossier-detail">
    <small>DOSSIÊ // {detail.classification}</small>
    <strong>{detail.title}</strong>
    <p><b>STATUS:</b> {detail.status}</p>
    <p><b>IDENTIFICAÇÃO:</b> {detail.identity}</p>
    <p><b>PERFIL:</b> {detail.profile}</p>
    <p><b>HISTÓRICO AUTORIZADO:</b> {detail.records}</p>
    <p><b>OBSERVAÇÕES ORPHEUS:</b> Dados futuros dependem da progressão narrativa autorizada.</p>
    <button className={styles.backButton} onClick={onBack}>VOLTAR AO ÍNDICE</button>
  </div>;
}

function OperationalDetail({ detail, kind, onBack }: { detail: OperationalRecordDetail; kind: "file" | "message"; onBack: () => void }) {
  return <div className={styles.operationalDetail} data-testid={`${kind}-detail`}>
    <small>{kind === "file" ? "ORPHEUS // AUTHORIZED FILE" : "ORPHEUS // AUTHORIZED MESSAGE"}</small>
    <strong>{detail.title}</strong>
    <dl>
      <div><dt>CLASSIFICAÇÃO</dt><dd>{detail.classification}</dd></div>
      <div><dt>STATUS</dt><dd>{detail.status}</dd></div>
      <div><dt>ORIGEM</dt><dd>{detail.source}</dd></div>
      <div><dt>CANAL</dt><dd>{detail.channel}</dd></div>
    </dl>
    <h3>{kind === "file" ? "METADADOS DO FRAGMENTO" : "REGISTRO DA COMUNICAÇÃO"}</h3>
    <p>{detail.summary}</p>
    <p className={styles.classifiedNote}>{detail.note}</p>
    <button className={styles.backButton} onClick={onBack}>VOLTAR À LISTA</button>
  </div>;
}

interface OperationalPanelProps {
  module: OperationalModule;
  solvedCount: number;
  unlockedFiles: string[];
  unlockedMessages: string[];
  missionActive: boolean;
  onBack: () => void;
  onExportReport?: () => Promise<ExportResult>;
  onExportCard?: () => Promise<ExportResult>;
}

export function OperationalPanel({ module, solvedCount, unlockedFiles, unlockedMessages, missionActive, onBack, onExportReport, onExportCard }: OperationalPanelProps) {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState("");
  useEffect(() => { setSelectedRecord(null); setExportStatus(""); }, [module]);

  const title = module === "files" ? "ARQUIVOS" : module === "messages" ? "MENSAGENS" : module === "missions" ? "MISSÕES" : "RELATÓRIO FINAL";
  const icon = module === "files" ? "archive" : module === "messages" ? "message" : module === "missions" ? "target" : "report";
  const runExport = async (action: (() => Promise<ExportResult>) | undefined, label: string) => {
    if (!action) return;
    setExportStatus(`${label} // PROCESSANDO...`);
    try {
      const result = await action();
      setExportStatus(result.path ? `${label} SALVO // ${result.path}` : `${label} // DOWNLOAD INICIADO`);
    } catch {
      setExportStatus(`${label} // FALHA AO SALVAR`);
    }
  };

  const selectedDetail = selectedRecord
    ? module === "files" ? getOperationalFileDetail(selectedRecord) : module === "messages" ? getOperationalMessageDetail(selectedRecord) : null
    : null;

  return <section className={styles.panel} data-testid={`module-${module}`}>
    <header><div><Icon name={icon as any} size={23} /></div><span><small>ORPHEUS // {module.toUpperCase()}</small><h1>{title}</h1></span></header>
    {module === "files" && <>
      <p>Índice de fragmentos recuperados pelo canal narrativo. Arquivos não liberados permanecem protegidos.</p>
      {selectedDetail ? <OperationalDetail detail={selectedDetail} kind="file" onBack={() => setSelectedRecord(null)} /> :
      <div className={styles.dossierList}>{unlockedFiles.length ? unlockedFiles.map(file => <button className={styles.operationalItem} key={file} onClick={() => setSelectedRecord(file)}><span><strong>{file.toUpperCase()}</strong><small>FRAGMENTO RESTAURADO // CONTEÚDO AUTORIZADO</small></span><b>ABRIR</b></button>) : <div className={styles.result}><strong>ACESSO AO COFRE</strong><p>ACESSO NEGADO // NÍVEL DE AUTORIZAÇÃO INSUFICIENTE.</p><p>Arquivos restaurados: {solvedCount}/12. REQUER PROGRESSÃO.</p></div>}</div>}
    </>}
    {module === "messages" && <><p>Comunicações liberadas pela progressão da operação.</p>{selectedDetail ? <OperationalDetail detail={selectedDetail} kind="message" onBack={() => setSelectedRecord(null)} /> : <div className={styles.dossierList}>{unlockedMessages.length ? unlockedMessages.map(message => <button className={styles.operationalItem} key={message} onClick={() => setSelectedRecord(message)}><span><strong>{message.toUpperCase()}</strong><small>CANAL CIPHER // CONTEÚDO AUTORIZADO</small></span><b>ABRIR</b></button>) : <div className={styles.result}><strong>CAIXA DE ENTRADA VAZIA</strong><p>NENHUMA MENSAGEM AUTORIZADA NESTE ESTÁGIO.</p></div>}</div>}</>}
    {module === "missions" && <div className={styles.result}><strong>{missionActive ? "MISSÃO EM ANDAMENTO" : "MISSÃO EM ESPERA"}</strong><p>{missionActive ? "Recuperar a chave narrativa e identificar o padrão por trás do Protocolo Orpheus." : "A missão será disponibilizada quando a sequência narrativa for iniciada."}</p></div>}
    {module === "report" && <div className={styles.result}><strong>{solvedCount === 12 ? "RELATÓRIO FINAL DISPONÍVEL" : "RELATÓRIO FINAL BLOQUEADO"}</strong><p>{solvedCount === 12 ? "A operação principal foi concluída. Exporte o relatório operacional ou o cartão sem spoilers." : `PROGRESSÃO INCOMPLETA // ${solvedCount}/12 enigmas restaurados.`}</p>{solvedCount === 12 && <><div className={styles.reportActions}>{onExportReport && <button onClick={() => { void runExport(onExportReport, "RELATÓRIO"); }}>EXPORTAR RELATÓRIO</button>}{onExportCard && <button onClick={() => { void runExport(onExportCard, "CARTÃO"); }}>CARTÃO SEM SPOILERS</button>}</div>{exportStatus && <p className={styles.exportStatus} role="status">{exportStatus}</p>}</>}</div>}
    <button className={styles.backButton} onClick={onBack}>VOLTAR</button>
  </section>;
}
