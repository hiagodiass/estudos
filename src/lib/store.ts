// Camada de persistência local do EstudoFlow.
//
// Todos os dados (matérias, assuntos, streak, configurações) ficam em
// uma única chave do localStorage ("estudoflow.v1")...

import type {
  AppData,
  AppSettings,
  Subject,
  StreakState,
  Topic,
  TopicStatus,
} from "@/types/store";

const STORAGE_KEY = "estudoflow.v1";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

/** Chave de dia local (YYYY-MM-DD), não UTC — importante para o streak bater com o fuso da pessoa. */
function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seedData(): AppData {
  const subjectTI: Subject = {
    id: uid(),
    name: "Tecnologia da Informação",
    color: "#EF5A5A",
    createdAt: nowISO(),
  };
  const subjectPT: Subject = {
    id: uid(),
    name: "Português",
    color: "#5B8DEF",
    createdAt: nowISO(),
  };
  const subjectMAT: Subject = {
    id: uid(),
    name: "Matemática",
    color: "#3DD68C",
    createdAt: nowISO(),
  };

  const completedAt = nowISO();
  const reviewAt = new Date(Date.now() + SEVEN_DAYS_MS).toISOString();

  const topics: Topic[] = [
    {
      id: uid(),
      subjectId: subjectTI.id,
      name: "Algoritmo de Criptografia",
      status: "estudando",
      week: 1,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      completedAt: null,
      reviewAt: null,
    },
    {
      id: uid(),
      subjectId: subjectTI.id,
      name: "Backup",
      status: "estudando",
      week: 1,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      completedAt: null,
      reviewAt: null,
    },
    {
      id: uid(),
      subjectId: subjectPT.id,
      name: "Pronomes",
      status: "concluido",
      week: 1,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      completedAt,
      reviewAt,
    },
    {
      id: uid(),
      subjectId: subjectMAT.id,
      name: "Funções quadráticas",
      status: "pendente",
      week: 1,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      completedAt: null,
      reviewAt: null,
    },
  ];

  return {
    version: 1,
    subjects: [subjectTI, subjectPT, subjectMAT],
    topics,
    settings: { weeklyGoal: 100, weeklyGoalsByWeek: {}, examDate: null },
    streak: { count: 3, lastActiveDate: dateKey(new Date()) },
  };
}

/** Formato "cru" e permissivo usado só durante leitura/migração — campos
 *  podem faltar em backups antigos, então nada aqui é obrigatório. */
interface RawAppData {
  subjects?: Subject[];
  topics?: Array<Partial<Topic> & { id: string; subjectId: string; name: string }>;
  settings?: Partial<AppSettings>;
  streak?: Partial<StreakState>;
}

function isRawAppData(value: unknown): value is RawAppData {
  if (!value || typeof value !== "object") return false;
  const v = value as RawAppData;
  return Array.isArray(v.subjects) && Array.isArray(v.topics);
}

/** Converte o valor cru de `weeklyGoalsByWeek` (pode vir de um backup antigo
 *  ou de JSON externo) num Record<number, number> válido, descartando
 *  entradas inválidas ou não-positivas. */
function normalizeWeeklyGoalsByWeek(raw: unknown): Record<number, number> {
  if (!raw || typeof raw !== "object") return {};
  const result: Record<number, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const week = Number(key);
    const goal = Number(value);
    if (Number.isFinite(week) && Number.isFinite(goal) && goal > 0) {
      result[week] = Math.round(goal);
    }
  }
  return result;
}

function normalize(raw: RawAppData): AppData {
  const settings: AppSettings = {
    weeklyGoal: raw.settings?.weeklyGoal ?? 5,
    weeklyGoalsByWeek: normalizeWeeklyGoalsByWeek(raw.settings?.weeklyGoalsByWeek),
    examDate: raw.settings?.examDate ?? null,
  };
  const streak: StreakState = {
    count: raw.streak?.count ?? 0,
    lastActiveDate: raw.streak?.lastActiveDate ?? null,
  };

  const topics: Topic[] = (raw.topics ?? []).map((t) => ({
    id: t.id,
    subjectId: t.subjectId,
    name: t.name,
    status: t.status ?? "pendente",
    week: t.week ?? 1,
    createdAt: t.createdAt ?? nowISO(),
    updatedAt: t.updatedAt ?? nowISO(),
    completedAt: t.completedAt ?? null,
    reviewAt: t.reviewAt ?? null,
  }));

  return {
    version: 1,
    subjects: raw.subjects ?? [],
    topics,
    settings,
    streak,
  };
}

function readFromStorage(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!isRawAppData(parsed)) throw new Error("Formato inválido");
    return normalize(parsed);
  } catch (error) {
    console.warn("Não foi possível ler os dados salvos, iniciando do zero:", error);
    const seeded = seedData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

let data: AppData = readFromStorage();
const listeners = new Set<() => void>();

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Nova referência de objeto — é isso que faz o useSyncExternalStore
  // perceber que o snapshot mudou e disparar um re-render.
  data = { ...data };
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): AppData {
  return data;
}

// ---------- Matérias ----------

export function createSubject(input: { name: string; color: string }): Subject {
  const subject: Subject = {
    id: uid(),
    name: input.name,
    color: input.color,
    createdAt: nowISO(),
  };
  data.subjects = [...data.subjects, subject];
  persist();
  return subject;
}

export function updateSubject(id: string, input: { name: string; color: string }) {
  data.subjects = data.subjects.map((s) => (s.id === id ? { ...s, ...input } : s));
  persist();
}

export function deleteSubject(id: string) {
  data.subjects = data.subjects.filter((s) => s.id !== id);
  data.topics = data.topics.filter((t) => t.subjectId !== id);
  persist();
}

// ---------- Assuntos ----------

export function createTopic(input: { subjectId: string; name: string; week: number }): Topic {
  const topic: Topic = {
    id: uid(),
    subjectId: input.subjectId,
    name: input.name,
    status: "pendente",
    week: input.week > 0 ? Math.floor(input.week) : 1,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    completedAt: null,
    reviewAt: null,
  };
  data.topics = [...data.topics, topic];
  persist();
  return topic;
}

export function updateTopic(
  id: string,
  input: Partial<Pick<Topic, "name" | "subjectId" | "week">>
) {
  data.topics = data.topics.map((t) => (t.id === id ? { ...t, ...input } : t));
  persist();
}

function bumpStreak(streak: StreakState, today: string): StreakState {
  if (streak.lastActiveDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = streak.lastActiveDate === dateKey(yesterday);

  return {
    count: wasYesterday ? streak.count + 1 : 1,
    lastActiveDate: today,
  };
}

export function updateTopicStatus(id: string, status: TopicStatus) {
  const topic = data.topics.find((t) => t.id === id);
  if (!topic) return;

  const wasCompleted = topic.status === "concluido";
  const isNowCompleted = status === "concluido";

  let completedAt = topic.completedAt;
  let reviewAt = topic.reviewAt;

  if (isNowCompleted && !wasCompleted) {
    const completedDate = new Date();
    completedAt = completedDate.toISOString();
    reviewAt = new Date(completedDate.getTime() + SEVEN_DAYS_MS).toISOString();
    data.streak = bumpStreak(data.streak, dateKey(completedDate));
  } else if (!isNowCompleted && wasCompleted) {
    completedAt = null;
    reviewAt = null;
  }

  data.topics = data.topics.map((t) =>
    t.id === id ? { ...t, status, updatedAt: nowISO(), completedAt, reviewAt } : t
  );
  persist();
}

export function deleteTopic(id: string) {
  data.topics = data.topics.filter((t) => t.id !== id);
  persist();
}

// ---------- Configurações ----------

export function updateSettings(input: Partial<AppSettings>) {
  data.settings = { ...data.settings, ...input };
  persist();
}

/** Meta de assuntos/semana efetiva: usa a meta específica da semana, se
 *  houver, senão cai para a meta padrão (`settings.weeklyGoal`). */
export function getWeeklyGoal(settings: AppSettings, week: number): number {
  const override = settings.weeklyGoalsByWeek[week];
  if (override && override > 0) return override;
  return Math.max(settings.weeklyGoal, 1);
}

/** Define (ou remove, passando `goal <= 0`) a meta individual de uma
 *  semana. Quando removida, a semana volta a usar a meta padrão. */
export function setWeeklyGoalForWeek(week: number, goal: number) {
  const nextGoals = { ...data.settings.weeklyGoalsByWeek };
  if (goal > 0) {
    nextGoals[week] = Math.round(goal);
  } else {
    delete nextGoals[week];
  }
  data.settings = { ...data.settings, weeklyGoalsByWeek: nextGoals };
  persist();
}

// ---------- Dados / manutenção ----------

export function resetAll() {
  data = seedData();
  data.subjects = [];
  data.topics = [];
  data.streak = { count: 0, lastActiveDate: null };
  persist();
}

export function exportData(): string {
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json);
    if (!isRawAppData(parsed)) {
      return { ok: false, error: "O arquivo não tem o formato esperado do EstudoFlow." };
    }
    data = normalize(parsed);
    persist();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "JSON inválido.",
    };
  }
}