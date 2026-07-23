import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Subject } from "@/types/store";

interface NewTopicDialogProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  defaultWeek: number;
  onCreate: (input: { subjectId: string; name: string; week: number }) => void;
}

export function NewTopicDialog({
  open,
  onClose,
  subjects,
  defaultWeek,
  onCreate,
}: NewTopicDialogProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [name, setName] = useState("");
  const [week, setWeek] = useState(defaultWeek);

  function handleClose() {
    setName("");
    setWeek(defaultWeek);
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !subjectId) return;
    onCreate({ subjectId, name: trimmed, week: week > 0 ? week : 1 });
    handleClose();
  }

  if (subjects.length === 0) {
    return (
      <Dialog open={open} onClose={handleClose} title="Novo assunto">
        <p className="text-sm text-muted">
          Crie uma matéria primeiro, na página{" "}
          <span className="font-medium text-foreground">Matérias</span>, para depois
          adicionar assuntos a ela.
        </p>
        <div className="mt-4">
          <Button size="sm" variant="secondary" onClick={handleClose}>
            Entendi
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Novo assunto"
      description="Adicione um assunto a uma matéria e semana de estudo."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="topic-subject">Matéria</Label>
          <select
            id="topic-subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:border-accent"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="topic-name">Nome do assunto</Label>
          <Input
            id="topic-name"
            autoFocus
            placeholder="Ex: Funções quadráticas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="topic-week">Semana</Label>
          <Input
            id="topic-week"
            type="number"
            min={1}
            value={week}
            onChange={(e) => setWeek(Number(e.target.value) || 1)}
            className="max-w-[7rem]"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" disabled={!name.trim() || !subjectId}>
            Criar assunto
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
