import { supabase } from "@/lib/supabaseClient";
import type { AppSettings, StreakState, Subject, Topic, TopicStatus } from "@/types/store";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ---------- Fetch ----------

export async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, color, created_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((s) => ({ id: s.id, name: s.name, color: s.color, createdAt: s.created_at }));
}

export async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("id, subject_id, name, status, week, created_at, updated_at, completed_at, review_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
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

export async function resetAllData(userId: string) {
  await supabase.from("topics").delete().eq("user_id", userId);
  await supabase.from("subjects").delete().eq("user_id", userId);
  await supabase.from("streak").delete().eq("user_id", userId);
  await supabase.from("settings").delete().eq("user_id", userId);
}

/** Importa um backup JSON (mesmo formato do exportData) direto pro Supabase.
 *  Usado tanto pra restaurar um backup quanto pra migração única do localStorage. */
export async function importBackup(userId: string, json: string) {
  const parsed = JSON.parse(json);
  if (!parsed.subjects || !parsed.topics) {
    throw new Error("Formato de backup inválido.");
  }

  await resetAllData(userId);

  const subjectIdMap = new Map<string, string>();

  for (const s of parsed.subjects) {
    const { data, error } = await supabase
      .from("subjects")
      .insert({ user_id: userId, name: s.name, color: s.color, created_at: s.createdAt })
      .select("id")
      .single();
    if (error) throw error;
    subjectIdMap.set(s.id, data.id);
  }

  for (const t of parsed.topics) {
    const mappedSubjectId = subjectIdMap.get(t.subjectId);
    if (!mappedSubjectId) continue;
    const { error } = await supabase.from("topics").insert({
      user_id: userId,
      subject_id: mappedSubjectId,
      name: t.name,
      status: t.status ?? "pendente",
      week: t.week ?? 1,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
      completed_at: t.completedAt,
      review_at: t.reviewAt,
    });
    if (error) throw error;
  }

  if (parsed.settings) {
    const { error } = await supabase.from("settings").upsert({
      user_id: userId,
      weekly_goal: parsed.settings.weeklyGoal ?? 5,
      weekly_goals_by_week: parsed.settings.weeklyGoalsByWeek ?? {},
      exam_date: parsed.settings.examDate ?? null,
    });
    if (error) throw error;
  }

  if (parsed.streak) {
    const { error } = await supabase.from("streak").upsert({
      user_id: userId,
      count: parsed.streak.count ?? 0,
      last_active_date: parsed.streak.lastActiveDate ?? null,
    });
    if (error) throw error;
  }
}