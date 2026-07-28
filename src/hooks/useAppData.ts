import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import * as api from "@/lib/api";
import type { AppSettings, TopicStatus } from "@/types/store";

export function useAppData() {
  const { user } = useAuth();
  const userId = user!.id; // seguro: useAppData só é usado dentro de RequireAuth
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({ queryKey: ["subjects", userId], queryFn: api.fetchSubjects });
  const topicsQuery = useQuery({ queryKey: ["topics", userId], queryFn: api.fetchTopics });
  const settingsQuery = useQuery({
    queryKey: ["settings", userId],
    queryFn: () => api.fetchSettings(userId),
  });
  const streakQuery = useQuery({
    queryKey: ["streak", userId],
    queryFn: () => api.fetchStreak(userId),
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["subjects", userId] });
    queryClient.invalidateQueries({ queryKey: ["topics", userId] });
    queryClient.invalidateQueries({ queryKey: ["settings", userId] });
    queryClient.invalidateQueries({ queryKey: ["streak", userId] });
  }

  const createSubjectMut = useMutation({
    mutationFn: (input: { name: string; color: string }) => api.createSubject(userId, input),
    onSuccess: invalidateAll,
  });
  const updateSubjectMut = useMutation({
    mutationFn: (vars: { id: string; input: { name: string; color: string } }) =>
      api.updateSubject(vars.id, vars.input),
    onSuccess: invalidateAll,
  });
  const deleteSubjectMut = useMutation({
    mutationFn: (id: string) => api.deleteSubject(id),
    onSuccess: invalidateAll,
  });

  const createTopicMut = useMutation({
    mutationFn: (input: { subjectId: string; name: string; week: number }) =>
      api.createTopic(userId, input),
    onSuccess: invalidateAll,
  });
  const updateTopicMut = useMutation({
    mutationFn: (vars: { id: string; input: Partial<{ name: string; subjectId: string; week: number }> }) =>
      api.updateTopic(vars.id, vars.input),
    onSuccess: invalidateAll,
  });
  const updateTopicStatusMut = useMutation({
    mutationFn: (vars: { topicId: string; status: TopicStatus }) => {
      const topic = topicsQuery.data?.find((t) => t.id === vars.topicId);
      if (!topic) throw new Error("Assunto não encontrado");
      return api.updateTopicStatus(userId, topic, vars.status);
    },
    onSuccess: invalidateAll,
  });
  const deleteTopicMut = useMutation({
    mutationFn: (id: string) => api.deleteTopic(id),
    onSuccess: invalidateAll,
  });
  const markTopicReviewedMut = useMutation({
    mutationFn: (id: string) => api.markTopicReviewed(id),
    onSuccess: invalidateAll,
  });

  const updateSettingsMut = useMutation({
    mutationFn: (input: Partial<AppSettings>) => api.upsertSettings(userId, input),
    onSuccess: invalidateAll,
  });
  const setWeeklyGoalMut = useMutation({
    mutationFn: (vars: { week: number; goal: number }) =>
      api.setWeeklyGoalForWeek(userId, vars.week, vars.goal),
    onSuccess: invalidateAll,
  });
  const resetAllMut = useMutation({
    mutationFn: () => api.resetAllData(userId),
    onSuccess: invalidateAll,
  });

  return {
    subjects: subjectsQuery.data ?? [],
    topics: topicsQuery.data ?? [],
    settings: settingsQuery.data ?? { weeklyGoal: 5, weeklyGoalsByWeek: {}, examDate: null },
    streak: streakQuery.data ?? { count: 0, lastActiveDate: null },
    isLoading:
      subjectsQuery.isLoading || topicsQuery.isLoading || settingsQuery.isLoading || streakQuery.isLoading,

    createSubject: (input: { name: string; color: string }) => createSubjectMut.mutate(input),
    updateSubject: (id: string, input: { name: string; color: string }) =>
      updateSubjectMut.mutate({ id, input }),
    deleteSubject: (id: string) => deleteSubjectMut.mutate(id),

    createTopic: (input: { subjectId: string; name: string; week: number }) =>
      createTopicMut.mutate(input),
    updateTopic: (id: string, input: Partial<{ name: string; subjectId: string; week: number }>) =>
      updateTopicMut.mutate({ id, input }),
    updateTopicStatus: (topicId: string, status: TopicStatus) =>
      updateTopicStatusMut.mutate({ topicId, status }),
    deleteTopic: (id: string) => deleteTopicMut.mutate(id),
    markTopicReviewed: (id: string) => markTopicReviewedMut.mutate(id),

    updateSettings: (input: Partial<AppSettings>) => updateSettingsMut.mutate(input),
    setWeeklyGoalForWeek: (week: number, goal: number) => setWeeklyGoalMut.mutate({ week, goal }),
    resetAll: () => resetAllMut.mutate(),

    exportData: () =>
      JSON.stringify(
        {
          version: 1,
          subjects: subjectsQuery.data ?? [],
          topics: topicsQuery.data ?? [],
          settings: settingsQuery.data,
          streak: streakQuery.data,
        },
        null,
        2
      ),

    importData: async (json: string) => {
      try {
        await api.importBackup(userId, json);
        invalidateAll();
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : "Erro ao importar." };
      }
    },
  };
}