import { enigmaDefinitions } from "../../data/enigmas";

export interface OperationalRecordDetail {
  id: string;
  title: string;
  classification: string;
  status: string;
  source: string;
  channel: string;
  summary: string;
  note: string;
}

function enigmaByNumber(number: number) {
  return enigmaDefinitions.find((item) => item.number === number);
}

export function getOperationalFileDetail(id: string): OperationalRecordDetail {
  const match = /^operation-fragment-(\d{2})$/i.exec(id);
  const number = match ? Number(match[1]) : NaN;
  const enigma = Number.isFinite(number) ? enigmaByNumber(number) : undefined;
  return {
    id,
    title: id.toUpperCase(),
    classification: "AUTHORIZED FRAGMENT",
    status: "RESTORED",
    source: enigma?.title ?? "ORIGEM NÃO INDEXADA",
    channel: enigma?.subtitle ?? "ORPHEUS // FILE CHANNEL",
    summary: enigma?.description ?? "Nenhum metadado narrativo adicional está autorizado para este fragmento.",
    note: "Este registro expõe somente metadados públicos já presentes no aplicativo. Conteúdo canônico sensível permanece protegido pelo canal narrativo.",
  };
}

export function getOperationalMessageDetail(id: string): OperationalRecordDetail {
  const match = /^cipher-message-(\d{2})$/i.exec(id);
  const messageNumber = match ? Number(match[1]) : NaN;
  const sourceNumber = Number.isFinite(messageNumber) ? messageNumber * 3 : NaN;
  const enigma = Number.isFinite(sourceNumber) ? enigmaByNumber(sourceNumber) : undefined;
  return {
    id,
    title: id.toUpperCase(),
    classification: "CIPHER CHANNEL",
    status: "RECEIVED",
    source: enigma?.title ?? "ORIGEM NÃO INDEXADA",
    channel: enigma?.subtitle ?? "ORPHEUS // MESSAGE CHANNEL",
    summary: enigma?.description ?? "Nenhum conteúdo narrativo adicional está autorizado para esta comunicação.",
    note: enigma
      ? `Comunicação de sistema liberada pela progressão associada a ${enigma.title}. Nenhum diálogo ou fato canônico novo foi acrescentado.`
      : "Comunicação de sistema registrada sem conteúdo narrativo adicional autorizado.",
  };
}
