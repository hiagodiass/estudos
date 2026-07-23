import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/types/store";

interface SubjectCardProps {
  subject: Subject;
  totalTopics: number;
  completedTopics: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function SubjectCard({
  subject,
  totalTopics,
  completedTopics,
  onEdit,
  onDelete,
  isDeleting,
}: SubjectCardProps) {
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  function handleCardClick() {
    if (confirmingDelete) return;
    navigate(`/materias/${subject.id}`);
  }

  return (
    <Card
      onClick={handleCardClick}
      style={{ borderTopColor: subject.color, borderTopWidth: 3 }}
      className="group cursor-pointer p-5 transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <h3 className="truncate text-sm font-semibold text-foreground">{subject.name}</h3>
        </div>

        {!confirmingDelete && (
          <div
            className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label="Editar matéria"
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Excluir matéria"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )}
      </div>

      {confirmingDelete ? (
        <div
          className="mt-4 flex items-center justify-between gap-2 rounded-md bg-destructive/10 px-3 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs text-foreground">
            Excluir "{subject.name}" e todos os seus assuntos?
          </p>
          <div className="flex shrink-0 gap-1.5">
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting}
              onClick={onDelete}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>
                {completedTopics}/{totalTopics} assuntos concluídos
              </span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: subject.color }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end text-muted-foreground transition-colors group-hover:text-accent">
            <ChevronRight size={16} />
          </div>
        </>
      )}
    </Card>
  );
}
