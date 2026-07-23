// Tipos do modelo de dados local (localStorage).
// O app funciona 100% no navegador, sem backend.
export type TopicStatus = "pendente" | "estudando" | "revisao" | "concluido";

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  status: TopicStatus;
  /** Semana de estudo à qual este assunto pertence (1, 2, 3...) */
  week: number;
  createdAt: string;
  updatedAt: string;
  /** Preenchido quando o status vira "concluido"; limpo se o status regride. */
  completedAt: string | null;
  /** completedAt + 7 dias — usado no painel "Próximas revisões". */
  reviewAt: string | null;
}

export interface AppSettings {
  /** Meta padrão (assuntos/semana), usada quando a semana não tem meta própria. */
  weeklyGoal: number;
  /** Metas individuais por semana (chave = número da semana). Semanas sem
   *  entrada aqui usam `weeklyGoal` como padrão. */
  weeklyGoalsByWeek: Record<number, number>;
  /** Data (YYYY-MM-DD) da prova, usada na contagem regressiva do Dashboard. */
  examDate: string | null;
}

export interface StreakState {
  count: number;
  /** Último dia (YYYY-MM-DD, horário local) em que um assunto foi concluído. */
  lastActiveDate: string | null;
}

export interface AppData {
  version: 1;
  subjects: Subject[];
  topics: Topic[];
  settings: AppSettings;
  streak: StreakState;
}