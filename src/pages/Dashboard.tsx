import { useMemo, useState } from "react";
import { BookOpen, ListChecks, TrendingUp, Target, Plus, Calendar } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusOverview } from "@/components/dashboard/StatusOverview";
import { WeekOverview } from "@/components/dashboard/WeekOverview";
import { UpcomingReviews } from "@/components/dashboard/UpcomingReviews";
import { NewTopicDialog } from "@/components/dashboard/NewTopicDialog";
import { ExamCountdown } from "@/components/dashboard/ExamCountdown";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useAppData } from "@/hooks/useAppData";
import { getWeeklyGoal } from "@/lib/store";
import { useSeo } from "@/lib/seo";
import type { TopicStatus } from "@/types/store";

const EMPTY_STATUS_COUNTS: Record<TopicStatus, number> = {
  pendente: 0,
  estudando: 0,
  revisao: 0,
  concluido: 0,
};

export default function Dashboard() {
  useSeo("Dashboard", "Visão geral do seu progresso nos estudos.");

  const { subjects, topics, settings, createTopic, updateTopicStatus, deleteTopic } =
    useAppData();

  const weeks = useMemo(() => {
    const set = new Set<number>(topics.map((t) => t.week));
    set.add(1);
    return Array.from(set).sort((a, b) => a - b);
  }, [topics]);

  const [selectedWeek, setSelectedWeek] = useState(weeks[0]);
  const [isCreating, setIsCreating] = useState(false);

  // Se a semana selecionada deixou de existir (ex: depois de apagar dados),
  // volta para a primeira semana disponível.
  const currentWeek = weeks.includes(selectedWeek) ? selectedWeek : weeks[0];

  const totalSubjects = subjects.length;

  // Tudo abaixo (assuntos, progresso e status) considera só os assuntos da
  // semana selecionada — só "Matérias" continua sendo um total geral, já
  // que matéria não pertence a uma semana específica.
  const weekTopics = useMemo(
    () => topics.filter((t) => t.week === currentWeek),
    [topics, currentWeek]
  );

  const totalWeekTopics = weekTopics.length;

  const statusCounts = weekTopics.reduce(
    (acc, topic) => {
      acc[topic.status] += 1;
      return acc;
    },
    { ...EMPTY_STATUS_COUNTS }
  );

  const weekProgress =
    totalWeekTopics > 0 ? Math.round((statusCounts.concluido / totalWeekTopics) * 100) : 0;

  const weeklyCompleted = statusCounts.concluido;
  // Meta efetiva da semana: usa a meta específica dessa semana, se houver,
  // senão cai para a meta padrão definida em Configurações.
  const weeklyGoal = getWeeklyGoal(settings, currentWeek);
  const weeklyProgress = Math.min(Math.round((weeklyCompleted / weeklyGoal) * 100), 100);

  return (
    <PageContainer
      title="Dashboard"
      description="Visão geral do seu progresso nos estudos."
      actions={
        <>
          <Select
            value={currentWeek}
            onChange={setSelectedWeek}
            options={weeks.map((w) => ({ value: w, label: `Semana ${w}` }))}
            renderTrigger={() => (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Semana {currentWeek}
              </span>
            )}
          />
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={16} />
            Novo assunto
          </Button>
        </>
      }
    >
      <ExamCountdown />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Matérias" value={totalSubjects} icon={<BookOpen size={18} />} />
        <StatCard label="Assuntos (semana)" value={totalWeekTopics} icon={<ListChecks size={18} />} />
        <StatCard
          label="Progresso da semana"
          value={`${weekProgress}%`}
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label={`Meta semanal (${weeklyCompleted}/${weeklyGoal})`}
          value={`${weeklyProgress}%`}
          valueClassName="text-status-concluido"
          icon={<Target size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeekOverview
            week={currentWeek}
            subjects={subjects}
            topics={topics}
            onChangeStatus={updateTopicStatus}
            onDeleteTopic={deleteTopic}
          />
        </div>

        <div className="space-y-4">
          <StatusOverview counts={statusCounts} total={totalWeekTopics} />
          <UpcomingReviews topics={topics} subjects={subjects} />
        </div>
      </div>

      <NewTopicDialog
        open={isCreating}
        onClose={() => setIsCreating(false)}
        subjects={subjects}
        defaultWeek={currentWeek}
        onCreate={createTopic}
      />
    </PageContainer>
  );
}