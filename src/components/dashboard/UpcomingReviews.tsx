import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subject, Topic } from "@/types/store";

interface UpcomingReviewsProps {
  topics: Topic[];
  subjects: Subject[];
}

function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(date) - startOfDay(today)) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Atrasada";
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  return `Em ${diffDays} dias`;
}

/** Lista os próximos assuntos agendados para revisão (concluídos há ~7 dias). */
export function UpcomingReviews({ topics, subjects }: UpcomingReviewsProps) {
  const scheduled = topics
    .filter((t): t is Topic & { reviewAt: string } => Boolean(t.reviewAt))
    .sort((a, b) => new Date(a.reviewAt).getTime() - new Date(b.reviewAt).getTime())
    .slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Próximas revisões</CardTitle>
        <span className="text-xs text-muted-foreground">+7 dias após concluir</span>
      </CardHeader>
      <CardContent>
        {scheduled.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted">
            Complete assuntos para agendar revisões automaticamente.
          </div>
        ) : (
          <ul className="space-y-1">
            {scheduled.map((topic) => {
              const subject = subjects.find((s) => s.id === topic.subjectId);
              return (
                <li
                  key={topic.id}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-surface-hover"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: subject?.color ?? "#6B7280" }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{topic.name}</p>
                      <p className="truncate text-xs text-muted">{subject?.name ?? "Sem matéria"}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {formatReviewDate(topic.reviewAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
