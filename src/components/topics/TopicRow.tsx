import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import type { Topic, TopicStatus } from "@/types/store";

interface TopicRowProps {
  topic: Topic;
  onChangeStatus: (status: TopicStatus) => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function TopicRow({ topic, onChangeStatus, onDelete, isDeleting }: TopicRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (confirmingDelete) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-destructive/10 px-4 py-3">
        <p className="text-sm text-foreground">Excluir o assunto "{topic.name}"?</p>
        <div className="flex shrink-0 gap-1.5">
          <Button size="sm" variant="destructive" disabled={isDeleting} onClick={onDelete}>
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between gap-3 rounded-md border border-border px-4 py-3 transition-colors hover:bg-surface-hover">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{topic.name}</p>
        <p className="text-xs text-muted-foreground">Semana {topic.week}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={topic.status} onChange={onChangeStatus} />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Excluir assunto"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
