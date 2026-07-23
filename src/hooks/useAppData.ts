import { useSyncExternalStore } from "react";
import * as store from "@/lib/store";

/**
 * Hook único para ler e alterar os dados do EstudoFlow (matérias, assuntos,
 * streak e configurações). Qualquer componente que chame este hook
 * re-renderiza automaticamente sempre que os dados mudarem — em qualquer
 * lugar da árvore, não só no componente que fez a alteração.
 */
export function useAppData() {
  const data = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  return {
    subjects: data.subjects,
    topics: data.topics,
    settings: data.settings,
    streak: data.streak,

    createSubject: store.createSubject,
    updateSubject: store.updateSubject,
    deleteSubject: store.deleteSubject,

    createTopic: store.createTopic,
    updateTopic: store.updateTopic,
    updateTopicStatus: store.updateTopicStatus,
    deleteTopic: store.deleteTopic,

    updateSettings: store.updateSettings,
    setWeeklyGoalForWeek: store.setWeeklyGoalForWeek,
    resetAll: store.resetAll,
    exportData: store.exportData,
    importData: store.importData,
  };
}