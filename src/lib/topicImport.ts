import { subjectKey } from "@/lib/api";
import type { Subject, Topic } from "@/types/store";

export interface ParsedTopic {
  subjectId: string;
  name: string;
  week: number;
  /** Já existe (no app ou repetido na própria lista) — não será importado. */
  duplicate: boolean;
}

/** "S1", "S2 · SEMA", "Semana 3", "S4 - PC-AP"... O que vem depois do número
 *  (rótulo da banca/curso) é ignorado. */
const WEEK_HEADER = /^(?:s|semana)\s*(\d+)\s*(?:[·•\-–—:|(].*)?$/i;

/** Numeração no início do assunto: "4. ", "12) ", "7 - ". */
const LEADING_NUMBER = /^\d+\s*[.)\-–]\s+/;

const MAX_NAME_LENGTH = 120;

function topicKey(subjectId: string, week: number, name: string) {
  return `${subjectId}|${week}|${subjectKey(name)}`;
}

/** Converte uma lista colada (cabeçalhos de semana + um assunto por linha) em
 *  assuntos. Linhas "Matéria: assunto" usam a matéria indicada quando ela
 *  existe; senão a linha inteira vira assunto da matéria padrão. Assuntos
 *  antes do primeiro cabeçalho vão para `defaultWeek`. */
export function parseTopicList(
  text: string,
  subjects: Subject[],
  existingTopics: Topic[],
  defaultSubjectId: string,
  defaultWeek: number
): ParsedTopic[] {
  const subjectIdByKey = new Map(subjects.map((s) => [subjectKey(s.name), s.id]));
  const seen = new Set(existingTopics.map((t) => topicKey(t.subjectId, t.week, t.name)));
  const result: ParsedTopic[] = [];
  let week = defaultWeek;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const header = WEEK_HEADER.exec(line);
    if (header) {
      week = Math.max(1, Number(header[1]));
      continue;
    }

    let name = line.replace(LEADING_NUMBER, "").trim();
    let subjectId = defaultSubjectId;

    const colon = name.indexOf(":");
    if (colon > 0) {
      const prefixId = subjectIdByKey.get(subjectKey(name.slice(0, colon)));
      if (prefixId) {
        subjectId = prefixId;
        name = name.slice(colon + 1).trim();
      }
    }

    name = name.slice(0, MAX_NAME_LENGTH);
    if (!name) continue;

    const key = topicKey(subjectId, week, name);
    result.push({ subjectId, name, week, duplicate: seen.has(key) });
    seen.add(key);
  }

  return result;
}
