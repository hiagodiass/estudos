import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Subject } from "@/types/store";

export interface SubjectProgress {
  subject: Subject;
  total: number;
  completed: number;
}

interface SubjectProgressListProps {
  items: SubjectProgress[];
}

/** Lista de matérias com barra de progresso individual; clicar navega para o detalhe. */
export function SubjectProgressList({ items }: SubjectProgressListProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por matéria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 && (
          <p className="text-sm text-muted">Nenhuma matéria cadastrada ainda.</p>
        )}

        {items.map(({ subject, total, completed }) => {
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div
              key={subject.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/materias/${subject.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate(`/materias/${subject.id}`);
              }}
              className="-mx-2 cursor-pointer space-y-1.5 rounded-md p-2 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="truncate font-medium text-foreground">{subject.name}</span>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {completed}/{total} · {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-status-concluido transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}