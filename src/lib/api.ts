import { supabase } from "@/lib/supabaseClient";
import type { AppSettings, StreakState, Subject, Topic, TopicStatus } from "@/types/store";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---------- Matérias fixas ----------

/** Matérias que sempre existem: são criadas automaticamente quando faltam
 *  (conta nova, depois do "Apagar tudo" ou se forem excluídas). */
export const FIXED_SUBJECTS = [
  { name: "Português", color: "#5B8DEF" },
  { name: "Raciocínio Lógico", color: "#F0A93A" },
  { name: "TI", color: "#3DD68C" },
];

/** Nomes alternativos (já normalizados) que contam como a mesma matéria fixa. */
const SUBJECT_ALIASES: Record<string, string> = {
  "lingua portuguesa": "portugues",
  "tecnologia da informacao": "ti",
};

/** Chave de comparação: ignora maiúsculas, acentos, espaços extras e aliases. */
export function subjectKey(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return SUBJECT_ALIASES[normalized] ?? normalized;
}

const FIXED_SUBJECT_KEYS = new Set(FIXED_SUBJECTS.map((s) => subjectKey(s.name)));

export function isFixedSubject(name: string): boolean {
  return FIXED_SUBJECT_KEYS.has(subjectKey(name));
}

let ensuringFixedSubjects: Promise<void> | null = null;

/** Cria as matérias fixas que ainda não existem. Chamadas simultâneas
 *  reaproveitam a mesma execução para não criar matérias duplicadas. */
function ensureFixedSubjects(userId: string): Promise<void> {
  if (!ensuringFixedSubjects) {
    ensuringFixedSubjects = (async () => {
      const { data, error } = await supabase.from("subjects").select("name");
      if (error) throw error;
      const existing = new Set(data.map((s) => subjectKey(s.name)));
      const missing = FIXED_SUBJECTS.filter((s) => !existing.has(subjectKey(s.name)));
      if (missing.length === 0) return;
      const { error: insertError } = await supabase
        .from("subjects")
        .insert(missing.map((s) => ({ user_id: userId, ...s })));
      if (insertError) throw insertError;
    })().finally(() => {
      ensuringFixedSubjects = null;
    });
  }
  return ensuringFixedSubjects;
}

// ---------- Fetch ----------

/** O Supabase devolve no máximo 1000 linhas por consulta, então busca em partes. */
const PAGE_SIZE = 1000;

async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

export async function fetchSubjects(userId: string): Promise<Subject[]> {
  await ensureFixedSubjects(userId);
  const data = await fetchAllRows((from, to) =>
    supabase
      .from("subjects")
      .select("id, name, color, created_at")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to)
  );
  return data.map((s) => ({ id: s.id, name: s.name, color: s.color, createdAt: s.created_at }));
}

export async function fetchTopics(): Promise<Topic[]> {
  const data = await fetchAllRows((from, to) =>
    supabase
      .from("topics")
      .select("id, subject_id, name, status, week, created_at, updated_at, completed_at, review_at")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to)
  );
  return data.map((t) => ({
    id: t.id,
    subjectId: t.subject_id,
    name: t.name,
    status: t.status,
    week: t.week,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    completedAt: t.completed_at,
    reviewAt: t.review_at,
  }));
}

export async function fetchSettings(userId: string): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("settings")
    .select("weekly_goal, weekly_goals_by_week, exam_date")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { weeklyGoal: 5, weeklyGoalsByWeek: {}, examDate: null };
  return {
    weeklyGoal: data.weekly_goal,
    weeklyGoalsByWeek: data.weekly_goals_by_week ?? {},
    examDate: data.exam_date,
  };
}

export async function fetchStreak(userId: string): Promise<StreakState> {
  const { data, error } = await supabase
    .from("streak")
    .select("count, last_active_date")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { count: 0, lastActiveDate: null };
  return { count: data.count, lastActiveDate: data.last_active_date };
}

// ---------- Subjects ----------

export async function createSubject(userId: string, input: { name: string; color: string }) {
  const { error } = await supabase.from("subjects").insert({ user_id: userId, ...input });
  if (error) throw error;
}

export async function updateSubject(id: string, input: { name: string; color: string }) {
  const { error } = await supabase.from("subjects").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteSubject(id: string) {
  // Apaga os assuntos antes, sem depender de ON DELETE CASCADE no banco.
  const { error: topicsError } = await supabase.from("topics").delete().eq("subject_id", id);
  if (topicsError) throw topicsError;
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Topics ----------

export async function createTopic(
  userId: string,
  input: { subjectId: string; name: string; week: number }
) {
  const { error } = await supabase.from("topics").insert({
    user_id: userId,
    subject_id: input.subjectId,
    name: input.name,
    week: input.week > 0 ? Math.floor(input.week) : 1,
    status: "pendente",
  });
  if (error) throw error;
}

export async function updateTopic(
  id: string,
  input: Partial<{ name: string; subjectId: string; week: number }>
) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.subjectId !== undefined) payload.subject_id = input.subjectId;
  if (input.week !== undefined) payload.week = input.week;
  const { error } = await supabase.from("topics").update(payload).eq("id", id);
  if (error) throw error;
}

export async function updateTopicStatus(userId: string, topic: Topic, status: TopicStatus) {
  const wasCompleted = topic.status === "concluido";
  const isNowCompleted = status === "concluido";

  let completedAt = topic.completedAt;
  let reviewAt = topic.reviewAt;

  if (isNowCompleted && !wasCompleted) {
    const completedDate = new Date();
    completedAt = completedDate.toISOString();
    reviewAt = new Date(completedDate.getTime() + SEVEN_DAYS_MS).toISOString();
    await bumpStreak(userId, dateKey(completedDate));
  } else if (!isNowCompleted && wasCompleted) {
    completedAt = null;
    reviewAt = null;
  }

  const { error } = await supabase
    .from("topics")
    .update({ status, completed_at: completedAt, review_at: reviewAt, updated_at: new Date().toISOString() })
    .eq("id", topic.id);
  if (error) throw error;
}

export async function deleteTopic(id: string) {
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) throw error;
}

export async function markTopicReviewed(id: string) {
  const { error } = await supabase
    .from("topics")
    .update({ review_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ---------- Settings ----------

export async function upsertSettings(userId: string, input: Partial<AppSettings>) {
  const current = await fetchSettings(userId);
  const next = { ...current, ...input };
  const { error } = await supabase.from("settings").upsert({
    user_id: userId,
    weekly_goal: next.weeklyGoal,
    weekly_goals_by_week: next.weeklyGoalsByWeek,
    exam_date: next.examDate,
  });
  if (error) throw error;
}

export async function setWeeklyGoalForWeek(userId: string, week: number, goal: number) {
  const current = await fetchSettings(userId);
  const nextGoals = { ...current.weeklyGoalsByWeek };
  if (goal > 0) nextGoals[week] = Math.round(goal);
  else delete nextGoals[week];

  const { error } = await supabase.from("settings").upsert({
    user_id: userId,
    weekly_goal: current.weeklyGoal,
    weekly_goals_by_week: nextGoals,
    exam_date: current.examDate,
  });
  if (error) throw error;
}

// ---------- Streak ----------

async function bumpStreak(userId: string, today: string) {
  const streak = await fetchStreak(userId);
  if (streak.lastActiveDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = streak.lastActiveDate === dateKey(yesterday);

  const { error } = await supabase.from("streak").upsert({
    user_id: userId,
    count: wasYesterday ? streak.count + 1 : 1,
    last_active_date: today,
  });
  if (error) throw error;
}

// ---------- Reset / importação ----------

/** Apaga todos os assuntos, as matérias não fixas, a streak e as configurações
 *  (data da prova e metas). As matérias fixas continuam existindo, vazias.
 *  Para no primeiro erro em vez de seguir sem avisar. */
export async function resetAllData(userId: string) {
  const { error: topicsError } = await supabase.from("topics").delete().eq("user_id", userId);
  if (topicsError) throw topicsError;

  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("user_id", userId);
  if (subjectsError) throw subjectsError;

  // Mantém uma matéria por matéria fixa; o resto (inclusive duplicadas) é apagado.
  const keptFixedIds = new Map<string, string>();
  const idsToDelete: string[] = [];
  for (const s of subjects) {
    const key = subjectKey(s.name);
    if (FIXED_SUBJECT_KEYS.has(key) && !keptFixedIds.has(key)) keptFixedIds.set(key, s.id);
    else idsToDelete.push(s.id);
  }
  if (idsToDelete.length > 0) {
    const { error } = await supabase.from("subjects").delete().in("id", idsToDelete);
    if (error) throw error;
  }

  // Padroniza nome e cor (ex.: "Língua Portuguesa" volta a ser "Português").
  for (const fixed of FIXED_SUBJECTS) {
    const id = keptFixedIds.get(subjectKey(fixed.name));
    if (!id) continue;
    const { error } = await supabase.from("subjects").update(fixed).eq("id", id);
    if (error) throw error;
  }

  const { error: streakError } = await supabase.from("streak").delete().eq("user_id", userId);
  if (streakError) throw streakError;
  const { error: settingsError } = await supabase.from("settings").delete().eq("user_id", userId);
  if (settingsError) throw settingsError;

  await ensureFixedSubjects(userId);
}

interface BackupTopic {
  name: string;
  status?: TopicStatus;
  week?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  reviewAt?: string | null;
  /** Só no formato antigo (versão 1). */
  subjectId?: string;
}

interface BackupSubject {
  /** Só no formato antigo (versão 1). */
  id?: string;
  name: string;
  color?: string;
  createdAt?: string;
  topics?: BackupTopic[];
}

interface BackupFile {
  subjects?: BackupSubject[];
  /** Só no formato antigo (versão 1): assuntos numa lista separada. */
  topics?: BackupTopic[];
  settings?: Partial<AppSettings>;
  streak?: Partial<StreakState>;
}

/** Monta o backup direto do banco (não do cache da tela): cada matéria traz
 *  os seus assuntos dentro dela, ordenados por semana. */
export async function exportBackup(userId: string): Promise<string> {
  const [subjects, topics, settings, streak] = await Promise.all([
    fetchSubjects(userId),
    fetchTopics(),
    fetchSettings(userId),
    fetchStreak(userId),
  ]);

  const toBackupTopic = (t: Topic): BackupTopic => ({
    name: t.name,
    status: t.status,
    week: t.week,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    completedAt: t.completedAt,
    reviewAt: t.reviewAt,
  });

  const subjectIds = new Set(subjects.map((s) => s.id));
  const topicsWithoutSubject = topics.filter((t) => !subjectIds.has(t.subjectId));

  return JSON.stringify(
    {
      version: 2,
      exportedAt: new Date().toISOString(),
      totals: { subjects: subjects.length, topics: topics.length },
      subjects: subjects.map((s) => {
        const subjectTopics = topics
          .filter((t) => t.subjectId === s.id)
          .sort((a, b) => a.week - b.week);
        return {
          name: s.name,
          color: s.color,
          createdAt: s.createdAt,
          topicCount: subjectTopics.length,
          topics: subjectTopics.map(toBackupTopic),
        };
      }),
      ...(topicsWithoutSubject.length > 0 && {
        topicsWithoutSubject: topicsWithoutSubject.map(toBackupTopic),
      }),
      settings,
      streak,
    },
    null,
    2
  );
}

/** Lê o backup e devolve as matérias já com os assuntos dentro, aceitando o
 *  formato novo (versão 2) e o antigo (versão 1). */
function parseBackup(json: string) {
  const parsed = JSON.parse(json) as BackupFile;
  if (!Array.isArray(parsed?.subjects) || parsed.subjects.some((s) => typeof s?.name !== "string")) {
    throw new Error("Formato de backup inválido.");
  }

  const isNestedFormat = parsed.subjects.every((s) => Array.isArray(s.topics));
  if (!isNestedFormat && !Array.isArray(parsed.topics)) {
    throw new Error("Formato de backup inválido.");
  }

  const subjects = parsed.subjects.map((s) => ({
    ...s,
    topics: isNestedFormat ? s.topics! : parsed.topics!.filter((t) => t.subjectId === s.id),
  }));
  return { subjects, settings: parsed.settings, streak: parsed.streak };
}

const INSERT_CHUNK_SIZE = 500;

/** Importa um backup JSON direto pro Supabase, substituindo os dados atuais.
 *  Matérias com o mesmo nome de uma matéria fixa (ou um alias dela) são
 *  juntadas a ela em vez de duplicadas. */
export async function importBackup(userId: string, json: string) {
  // Valida o arquivo antes de apagar qualquer coisa.
  const backup = parseBackup(json);

  await resetAllData(userId);

  const { data: existing, error: existingError } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("user_id", userId);
  if (existingError) throw existingError;
  const subjectIdByKey = new Map(existing.map((s) => [subjectKey(s.name), s.id as string]));

  const now = new Date().toISOString();
  const topicRows: Record<string, unknown>[] = [];

  for (const s of backup.subjects) {
    const key = subjectKey(s.name);
    let subjectId = subjectIdByKey.get(key);
    if (!subjectId) {
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          user_id: userId,
          name: s.name.trim(),
          color: s.color ?? FIXED_SUBJECTS[0].color,
          created_at: s.createdAt,
        })
        .select("id")
        .single();
      if (error) throw error;
      subjectId = data.id as string;
      subjectIdByKey.set(key, subjectId);
    }

    for (const t of s.topics) {
      const createdAt = t.createdAt ?? now;
      topicRows.push({
        user_id: userId,
        subject_id: subjectId,
        name: t.name,
        status: t.status ?? "pendente",
        week: t.week ?? 1,
        created_at: createdAt,
        updated_at: t.updatedAt ?? createdAt,
        completed_at: t.completedAt ?? null,
        review_at: t.reviewAt ?? null,
      });
    }
  }

  for (let i = 0; i < topicRows.length; i += INSERT_CHUNK_SIZE) {
    const { error } = await supabase.from("topics").insert(topicRows.slice(i, i + INSERT_CHUNK_SIZE));
    if (error) throw error;
  }

  if (backup.settings) {
    const { error } = await supabase.from("settings").upsert({
      user_id: userId,
      weekly_goal: backup.settings.weeklyGoal ?? 5,
      weekly_goals_by_week: backup.settings.weeklyGoalsByWeek ?? {},
      exam_date: backup.settings.examDate ?? null,
    });
    if (error) throw error;
  }

  if (backup.streak) {
    const { error } = await supabase.from("streak").upsert({
      user_id: userId,
      count: backup.streak.count ?? 0,
      last_active_date: backup.streak.lastActiveDate ?? null,
    });
    if (error) throw error;
  }
}
