import { Icon } from "../../components/Icon";
import styles from "./ModulePanel.module.css";
import { DossierDetail } from "./OperationalPanel";

export const DOSSIER_ENTRIES = [
  { subject: "blake", title: "BLAKE LANGMERE" },
  { subject: "evelyn", title: "EVELYN CROSS" },
  { subject: "gordon", title: "GORDON SULLIVAN" },
  { subject: "cipher", title: "CIPHER" },
  { subject: "orpheus", title: "ORPHEUS" },
] as const;

interface Props {
  module: "search" | "dossier" | "dorks";
  query?: string;
  subject?: string;
  onBack?: () => void;
  onSelectDossier?: (subject: string) => void;
  onQueryChange?: (value: string) => void;
}
export function ModulePanel({
  module,
  query = "",
  subject = "",
  onBack,
  onSelectDossier,
  onQueryChange,
}: Props) {
  const content = {
    search: {
      code: "SEARCH.01",
      title: "PESQUISA PROFUNDA",
      description:
        "Consulta preparada localmente. Nenhuma pesquisa externa será executada sem uma ação adicional do operador.",
    },
    dossier: {
      code: "DOSSIER.01",
      title: "ÍNDICE DE DOSSIÊS",
      description:
        "Conteúdo narrativo restrito ao material canônico já validado.",
    },
    dorks: {
      code: "DORKS.01",
      title: "DEEP DORKS",
      description:
        "Módulo preparado. Consultas ofensivas ou automáticas não estão disponíveis nesta build.",
    },
  }[module];
  return (
    <section className={styles.panel}>
      <header>
        <div>
          <Icon
            name={
              module === "search"
                ? "search"
                : module === "dossier"
                  ? "file"
                  : "terminal"
            }
            size={23}
          />
        </div>
        <span>
          <small>ORPHEUS // {content.code}</small>
          <h1>{content.title}</h1>
        </span>
      </header>
      <p>{content.description}</p>
      {module === "search" && (
        <label>
          <span>CONSULTA PREPARADA</span>
          <input
            value={query}
            onChange={(event) => onQueryChange?.(event.target.value)}
            autoFocus
          />
          <button>AGUARDAR AUTORIZAÇÃO</button>
        </label>
      )}
      {module === "dossier" && (
        <>
          {!subject && (
            <div className={styles.dossierList}>
              {DOSSIER_ENTRIES.map((entry) => (
                <button
                  key={entry.subject}
                  onClick={() => onSelectDossier?.(entry.subject)}
                >
                  <strong>{entry.title}</strong>
                  <span>VER DOSSIÊ</span>
                </button>
              ))}
            </div>
          )}
          {subject && <DossierDetail subject={subject} onBack={() => onSelectDossier?.("")} />} 
          {onBack && !subject && (<button className={styles.backButton} onClick={onBack}>VOLTAR</button>)}
        </>
      )}
      {module === "dorks" && (
        <div className={styles.result}>
          <small>MODULE STATUS</small>
          <strong>STANDBY</strong>
          <p>Nenhuma consulta foi executada.</p>
        </div>
      )}
    </section>
  );
}
