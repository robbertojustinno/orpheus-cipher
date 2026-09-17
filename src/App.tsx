import { useEffect, useRef, useState } from "react";
import { ActivityTerminal } from "./components/ActivityTerminal";
import { AlertPanel } from "./components/AlertPanel";
import { ConnectionMap } from "./components/ConnectionMap";
import { EnigmaCard } from "./components/EnigmaCard";
import { Icon } from "./components/Icon";
import { RightWidget } from "./components/RightWidget";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { TopBar } from "./components/TopBar";
import { LicenseGate } from "./features/license/components/LicenseGate";
import { LicenseStatusPanel } from "./features/license/components/LicenseStatusPanel";
import { useLicense } from "./features/license/hooks/useLicense";
import { hasCapability } from "./features/license/types/license";
import { resetMasterScope } from "./features/license/services/masterResetService";
import { EnigmaModal } from "./features/enigmas/EnigmaModal";
import { DetectionSequence } from "./features/narrative/DetectionSequence";
import { CompletionPanel } from "./features/narrative/CompletionPanel";
import { exportOperationReport, exportShareCard } from "./features/narrative/operationReport";
import { SecretRewardGate } from "./features/reward/SecretReward";
import { PrivacyPanel } from "./features/operator/PrivacyPanel";
import { ModulePanel } from "./features/modules/ModulePanel";
import { OperationalPanel } from "./features/modules/OperationalPanel";
import {
  DeepSearchPanel,
  type OsintRequest,
} from "./features/osint/components/DeepSearchPanel";
import type { TerminalAction } from "./features/terminal/commandTypes";
import { useNarrativeStore } from "./stores/narrativeStore";
import type { Enigma, OperatorIdentity } from "./types";
import { calculateOverallProgress } from "./features/enigmas/engine/progressionEngine";
import { enigmaDefinitions } from "./data/enigmas";
import { validateSecretInput } from "./features/enigmas/services/canonicalContent";
import styles from "./App.module.css";

const anonymousIdentity: OperatorIdentity = {
  username: "OPERADOR",
  hostname: "HOST-UNKNOWN",
  platform: "unknown",
  arch: "unknown",
};

function App() {
  const [active, setActive] = useState("Painel");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [interference, setInterference] = useState(false);
  const [selected, setSelected] = useState<Enigma | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [osintRequest, setOsintRequest] = useState<OsintRequest>({ nonce: 0 });
  const [dossierSubject, setDossierSubject] = useState("");
  const [highlightObjective, setHighlightObjective] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [rewardOpenRequest, setRewardOpenRequest] = useState(0);
  const licenseState = useLicense();
  const {
    hydration,
    progress,
    logs,
    enigmas,
    setLogs,
    addTerminalLog,
    setNarrativeState,
    startMission,
    openEnigma,
    submitEnigmaAnswer,
    unlockHint,
    devSetEnigma,
    resetNarrative,
    recordAudit,
    discoverSecretCommand,
  } = useNarrativeStore(licenseState.license ?? undefined);
  const completionObserved = useRef<boolean | null>(null);

  useEffect(() => {
    if (hydration !== "ready") return;
    if (completionObserved.current === null) {
      completionObserved.current = progress.campaignCompleted;
      return;
    }
    if (!completionObserved.current && progress.campaignCompleted) {
      setShowCompletion(true);
    }
    completionObserved.current = progress.campaignCompleted;
  }, [hydration, progress.campaignCompleted]);

  if (licenseState.hydration === "loading" || !licenseState.license)
    return (
      <LicenseGate
        hydration={licenseState.hydration}
        installationId={licenseState.installationId}
        validationCode={licenseState.validationCode}
        onActivate={licenseState.activate}
      />
    );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };
  const handleReturnToMain = () => {
    setShowCompletion(false);
    setSelected(null);
    setMenu(false);
    setActive("Painel");
  };
  const handleEnigma = (enigma: Enigma) => {
    if (enigma.status === "locked") return;
    setSelected(enigma);
    void openEnigma(enigma.id);
    addTerminalLog({
      source: "SYSTEM",
      type: "info",
      message: `Caixa Enigma ${String(enigma.number).padStart(2, "0")} acessada.`,
    });
    void recordAudit("ENIGMA_OPENED", enigma.id);
  };
  const handleTerminalAction = async (action: TerminalAction) => {
    if (action.type === "navigate") {
      setActive(action.destination);
      return;
    }
    if (action.type === "open-enigma") {
      const enigma = enigmas.find((item) => item.id === action.enigmaId);
      if (enigma) handleEnigma(enigma);
      return;
    }
    if (action.type === "highlight-objective") {
      setHighlightObjective(true);
      window.setTimeout(() => setHighlightObjective(false), 2400);
      return;
    }
    if (action.type === "prepare-search") {
      setSearchQuery(action.query);
      setOsintRequest({
        nonce: Date.now(),
        query: action.query,
        mode: "quick",
        action: "prepare",
      });
      setActive("Pesquisa Profunda");
      return;
    }
    if (action.type === "open-dossier") {
      setDossierSubject(action.subject);
      setActive("Dossiê");
      void recordAudit("DOSSIER_ACCESSED", action.subject);
    }
    if (action.type === "request-hint") {
      const result = await unlockHint(action.enigmaId);
      addTerminalLog(
        result.allowed
          ? {
              source: "ORPHEUS",
              type: "success",
              message: `${result.hintId} liberada.`,
            }
          : {
              source: "CIPHER",
              type: "warning",
              message:
                result.reason === "ALL_UNLOCKED"
                  ? "TODAS AS PISTAS LIBERADAS."
                  : "PISTA INDISPONÍVEL.",
            },
      );
      return;
    }
    if (action.type === "submit-answer") {
      const result = await submitEnigmaAnswer(action.enigmaId, action.answer);
      if (result.correct)
        addTerminalLog({
          source: "ORPHEUS",
          type: "success",
          message: "PATTERN CONFIRMED. FRAGMENT RESTORED.",
        });
      return;
    }
    if (action.type === "validate-secret") {
      const result = await validateSecretInput(action.rawInput, {
        founderId: progress.founderId,
        founderTotal: progress.founderTotal,
      });
      if (result.discovered && result.id) {
        await discoverSecretCommand(result.id);
        addTerminalLog({
          source: "CIPHER",
          type: "success",
          message: result.message ?? "CLASSIFIED DISCOVERY REGISTERED.",
        });
      } else
        addTerminalLog({
          source: "SYSTEM",
          type: "warning",
          message:
            'COMMAND NOT RECOGNIZED. TYPE "help" FOR AVAILABLE COMMANDS.',
        });
      return;
    }
    if (action.type === "osint") {
      setOsintRequest({
        nonce: Date.now(),
        query: action.query,
        mode: action.mode,
        action: action.action,
        format: action.format,
      });
      setActive(action.mode === "dork" ? "Deep Dorks" : "Pesquisa Profunda");
      return;
    }
  };
  const overall = calculateOverallProgress(enigmaDefinitions, progress);
  const solvedCount = enigmas.filter(
    (enigma) => enigma.status === "solved",
  ).length;
  const dashboard = !["Privacidade", "Pesquisa Profunda", "Dossiê", "Deep Dorks", "License Status", "Arquivos", "Mensagens", "Missões", "Relatório Final", "Caixa de Enigmas", "Distintivo"].includes(active);
  const identityVisible =
    progress.narrativeState === "DETECTED" ||
    progress.narrativeState === "MISSION_ACTIVE";
  const displayIdentity = identityVisible
    ? progress.operator
    : {
        ...anonymousIdentity,
        platform: progress.operator.platform,
        arch: progress.operator.arch,
      };

  return (
    <div className={`${styles.app} ${interference ? styles.interference : ""}`}>
      {hydration === "ready" && (
        <DetectionSequence
          state={progress.narrativeState}
          firstDetectionCompleted={progress.firstDetectionCompleted}
          identity={progress.operator}
          setState={setNarrativeState}
          addLog={addTerminalLog}
          setInterference={setInterference}
        />
      )}
      <TopBar
        onMenu={() => setMenu(true)}
        identity={displayIdentity}
        license={licenseState.license}
      />
      <Sidebar
        active={active}
        open={menu}
        showBadge={progress.campaignCompleted}
        onClose={() => setMenu(false)}
        onNavigate={(label) => {
          setActive(label);
          if (
            ![
              "Painel",
              "Privacidade",
              "Pesquisa Profunda",
              "Deep Dorks",
            ].includes(label)
          )
            notify(`${label.toUpperCase()} // Acesso solicitado`);
        }}
      />
      {menu && (
        <button
          className={styles.overlay}
          onClick={() => setMenu(false)}
          aria-label="Fechar menu"
        />
      )}
      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <span>ORPHEUS</span>
          <i>/</i>
          <strong>{active.toUpperCase()}</strong>
          <small>
            CIPHER NODE //{" "}
            {identityVisible ? progress.operator.username : "SESSION-UNBOUND"}
          </small>
          {hasCapability(licenseState.license, "master-reset") && (
            <button
              className={styles.devReset}
              onClick={async () => {
                await resetNarrative();
                location.reload();
              }}
            >
              RESET NARRATIVE STATE
            </button>
          )}
        </div>
        {dashboard ? (
          <div className={styles.layout}>
            <div className={styles.primary}>
              <AlertPanel
                onStart={startMission}
                onDossier={() => {
                  setDossierSubject("");
                  setActive("Dossiê");
                  void recordAudit("DOSSIER_ACCESSED", "orpheus");
                }}
                state={progress.narrativeState}
                identity={progress.operator}
              />
              <section className={styles.enigmas}>
                <header className={styles.sectionHeader}>
                  <div>
                    <b>02</b>
                    <div>
                      <h2>CAIXAS ENIGMAS</h2>
                      <small>ARQUIVOS NARRATIVOS // ACESSO PROGRESSIVO</small>
                    </div>
                  </div>
                  <div className={styles.overall}>
                    <div>
                      <span>PROGRESSO GERAL // {solvedCount}/12</span>
                      <strong>{overall}%</strong>
                    </div>
                    <div>
                      <i style={{ width: `${overall}%` }} />
                    </div>
                  </div>
                </header>
                <div className={styles.enigmaGrid}>
                  {enigmas.map((enigma) => (
                    <EnigmaCard
                      key={enigma.id}
                      enigma={enigma}
                      onAction={handleEnigma}
                    />
                  ))}
                </div>
              </section>
              <ActivityTerminal
                logs={logs}
                setLogs={setLogs}
                progress={progress}
                enigmas={enigmas}
                license={licenseState.license}
                onAction={handleTerminalAction}
                onAudit={(type, resource) => {
                  void recordAudit(type, resource);
                }}
              />
            </div>
            <aside className={styles.right}>
              <RightWidget
                title="OBJETIVO ATUAL"
                code="OBJ.01"
                className={highlightObjective ? styles.objectiveHighlight : ""}
              >
                <div className={styles.objectiveIcon}>
                  <Icon name="target" size={25} />
                </div>
                <p className={styles.objectiveText}>
                  {progress.narrativeState === "MISSION_ACTIVE"
                    ? "Recuperar a primeira chave narrativa e identificar o padrão por trás do Protocolo Orpheus."
                    : "Monitorar a integridade da sessão e aguardar novas instruções do sistema."}
                </p>
                <div className={styles.objectiveStatus}>
                  <i />
                  <div>
                    <small>STATUS</small>
                    <strong>
                      {progress.narrativeState === "MISSION_ACTIVE"
                        ? "Em andamento"
                        : "Monitorando"}
                    </strong>
                  </div>
                  <b>01</b>
                </div>
              </RightWidget>
              <RightWidget title="ARQUIVOS CORROMPIDOS" code="ARC.12">
                <div className={styles.files}>
                  <div className={styles.donut}>
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="41" />
                      <circle
                        className={styles.donutValue}
                        cx="50"
                        cy="50"
                        r="41"
                      />
                    </svg>
                    <div>
                      <strong>
                        {solvedCount}
                        <small>/12</small>
                      </strong>
                      <span>RESTAURADOS</span>
                    </div>
                  </div>
                  <div>
                    <strong>Arquivos restaurados</strong>
                    <p>{solvedCount} de 12 fragmentos recuperados.</p>
                    <button
                      onClick={() =>
                        setActive("Arquivos")
                      }
                    >
                      VER ARQUIVOS <Icon name="arrow" size={13} />
                    </button>
                  </div>
                </div>
              </RightWidget>
              <RightWidget title="MAPA DE CONEXÕES" code="NET.08">
                <ConnectionMap operatorName={displayIdentity.username} />
              </RightWidget>
            </aside>
          </div>
        ) : active === "Privacidade" ? (
          <PrivacyPanel />
        ) : active === "License Status" ? (
          <LicenseStatusPanel
            state={licenseState.state!}
            installationId={licenseState.installationId}
            graceRemainingDays={licenseState.graceRemainingDays}
            onMasterReset={async (action) => {
              if (action === "narrative") await resetNarrative();
              else if (action === "license") await licenseState.reset();
              else await resetMasterScope(action);
              location.reload();
            }}
          />
        ) : active === "Pesquisa Profunda" ? (
          <DeepSearchPanel
            initialQuery={searchQuery}
            request={osintRequest}
            onAudit={(type, resource) => {
              void recordAudit(type, resource);
            }}
            onInvestigationAudit={(type, resource) => {
              void recordAudit(type, resource);
            }}
          />
        ) : active === "Deep Dorks" ? (
          <DeepSearchPanel initialQuery={searchQuery} initialMode="dork" request={osintRequest} onAudit={(type, resource) => { void recordAudit(type, resource); }} onInvestigationAudit={(type, resource) => { void recordAudit(type, resource); }} />
        ) : active === "Dossiê" ? (
          <ModulePanel module="dossier" subject={dossierSubject} onSelectDossier={(subject) => { setDossierSubject(subject); void recordAudit("DOSSIER_ACCESSED", subject); }} onBack={() => dossierSubject ? setDossierSubject("") : setActive("Painel")} />
        ) : active === "Arquivos" ? (
          <OperationalPanel module="files" solvedCount={solvedCount} unlockedFiles={progress.unlockedFiles} unlockedMessages={progress.unlockedMessages} missionActive={progress.missionStarted} onBack={() => setActive("Painel")} />
        ) : active === "Mensagens" ? (
          <OperationalPanel module="messages" solvedCount={solvedCount} unlockedFiles={progress.unlockedFiles} unlockedMessages={progress.unlockedMessages} missionActive={progress.missionStarted} onBack={() => setActive("Painel")} />
        ) : active === "Missões" ? (
          <OperationalPanel module="missions" solvedCount={solvedCount} unlockedFiles={progress.unlockedFiles} unlockedMessages={progress.unlockedMessages} missionActive={progress.missionStarted} onBack={() => setActive("Painel")} />
        ) : active === "Relatório Final" ? (
          <OperationalPanel
            module="report"
            solvedCount={solvedCount}
            unlockedFiles={progress.unlockedFiles}
            unlockedMessages={progress.unlockedMessages}
            missionActive={progress.missionStarted}
            onExportReport={() => exportOperationReport(progress)}
            onExportCard={() => exportShareCard(progress)}
            onBack={() => setActive("Painel")}
          />
        ) : active === "Distintivo" ? (
          <section className={styles.panel}>
            <h1>DISTINTIVO CIPHER</h1>
            <p>REGISTRO DE OPERADOR // validando reconhecimento no canal seguro.</p>
            <button onClick={() => setActive("Painel")}>VOLTAR</button>
          </section>
        ) : active === "Caixa de Enigmas" ? (
                    <section className={styles.enigmas}>
            <header className={styles.sectionHeader}><div><b>02</b><div><h2>CAIXAS ENIGMAS</h2><small>ARQUIVOS NARRATIVOS // ACESSO PROGRESSIVO</small></div></div><div className={styles.overall}><div><span>PROGRESSO GERAL // {solvedCount}/12</span><strong>{overall}%</strong></div><div><i style={{ width: `${overall}%` }} /></div></div></header>
            <div className={styles.enigmaGrid}>{enigmas.map((enigma) => <EnigmaCard key={enigma.id} enigma={enigma} onAction={handleEnigma} />)}</div>
            <button className={styles.backButton} onClick={() => setActive("Painel")}>VOLTAR</button>
          </section>
        ) : (
          <section className={styles.panel}><h1>{active.toUpperCase()}</h1><p>ACESSO RESTRITO // Este módulo não possui conteúdo adicional autorizado nesta etapa.</p><button onClick={() => setActive("Painel")}>VOLTAR</button></section>
        )}      </main>
      <StatusBar />
      {selected &&
        (() => {
          const current =
            enigmas.find((item) => item.id === selected.id) ?? selected;
          return (
            <EnigmaModal
              enigma={current}
              onClose={() => setSelected(null)}
              onSubmit={(answer) => submitEnigmaAnswer(current.id, answer)}
              onHint={() => unlockHint(current.id)}
              onDevAction={
                import.meta.env.DEV
                  ? (action) => {
                      void devSetEnigma(current.id, action);
                    }
                  : undefined
              }
            />
          );
        })()}
      {progress.campaignCompleted && showCompletion && (
          <CompletionPanel
            progress={progress}
            onClose={() => {
              setShowCompletion(false);
              setSelected(null);
              setRewardOpenRequest((value) => value + 1);
            }}
          />
        )}
      {progress.campaignCompleted && licenseState.state && (
        <SecretRewardGate
          progress={progress}
          licenseState={licenseState.state}
          showTrigger={active === "Painel"}
          forceOpen={active === "Distintivo"}
          openRequest={rewardOpenRequest}
          onReturnToMain={handleReturnToMain}
        />
      )}
      {toast && (
        <div className={styles.toast}>
          <i />
          <div>
            <small>ORPHEUS // SISTEMA</small>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
