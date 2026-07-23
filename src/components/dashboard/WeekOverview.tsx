import { useState } from "react";
import { Calendar, ChevronDown, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Subject, Topic, TopicStatus } from "@/types/store";

interface WeekOverviewProps {
  week: number;
  subjects: Subject[];
  topics: Topic[];
  onChangeStatus: (topicId: string, status: TopicStatus) => void;
  onDeleteTopic: (topicId: string) => void;
}

function pct(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function WeekOverview({
  week,
  subjects,
  topics,
  onChangeStatus,
  onDeleteTopic,
}: WeekOverviewProps) {
  const weekTopics = topics.filter((t) => t.week === week);
  const completed = weekTopics.filter((t) => t.status === "concluido").length;
  const total = weekTopics.length;
  const progress = pct(completed, total);

  const groups = subjects
    .map((subject) => ({
      subject,
      items: weekTopics.filter((t) => t.subjectId === subject.id),
    }))
    .filter((group) => group.items.length > 0);

  // Cada matéria começa fechada — só mostra a lista de assuntos quando a
  // pessoa clica na seta, evitando que o dashboard fique gigante com muitos
  // assuntos por matéria.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpanded(subjectId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calendar size={16} className="text-muted" />
          Semana {week}
        </div>
        <span className="text-xs text-muted">
          {completed}/{total} · {progress}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-border">
        <div
          className="h-full bg-status-concluido transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <CardContent className="space-y-3 p-5">
        {groups.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            Nenhum assunto cadastrado para a semana {week} ainda.
          </p>
        )}

        {groups.map(({ subject, items }) => {
          const subCompleted = items.filter((t) => t.status === "concluido").length;
          const subTotal = items.length;
          const subProgress = pct(subCompleted, subTotal);
          const isOpen = expanded.has(subject.id);

          return (
            // Bloco isolado por matéria: borda + fundo levemente distinto, separando
            // visualmente uma matéria da outra dentro da visão semanal.
            <div
              key={subject.id}
              className="rounded-lg border border-border bg-surface-hover/40 p-3"
            >
              <button
                type="button"
                onClick={() => toggleExpanded(subject.id)}
                className="w-full space-y-1.5 text-left"
                aria-expanded={isOpen}
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                    <ChevronDown
                      size={14}
                      className={cn(
                        "shrink-0 text-muted transition-transform",
                        !isOpen && "-rotate-90"
                      )}
                    />
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="truncate">{subject.name}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {subCompleted}/{subTotal} · {subProgress}%
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${subProgress}%`, backgroundColor: subject.color }}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="mt-2 space-y-1 border-t border-border/60 pt-2">
                  {items.map((topic) => (
                    <div
                      key={topic.id}
                      className="group flex items-center justify-between gap-2 rounded px-1.5 py-1 transition-colors hover:bg-surface-hover"
                    >
                      <p className="min-w-0 truncate text-xs text-foreground">{topic.name}</p>
                      <div className="flex shrink-0 items-center gap-1">
                        <StatusBadge
                          status={topic.status}
                          onChange={(status) => onChangeStatus(topic.id, status)}
                          className="px-1.5 py-0.5 text-[11px]"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          onClick={() => onDeleteTopic(topic.id)}
                          aria-label="Excluir assunto"
                        >
                          <Trash2 size={11} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}