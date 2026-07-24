import type { AppSettings } from "@/types/store";

/** Meta de assuntos/semana efetiva: usa a meta específica da semana, se
 *  houver, senão cai para a meta padrão (`settings.weeklyGoal`). */
export function getWeeklyGoal(settings: AppSettings, week: number): number {
  const override = settings.weeklyGoalsByWeek[week];
  if (override && override > 0) return override;
  return Math.max(settings.weeklyGoal, 1);
}