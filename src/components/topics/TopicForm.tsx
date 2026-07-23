import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface TopicFormProps {
  defaultWeek?: number;
  onSubmit: (input: { name: string; week: number }) => void;
  onCancel: () => void;
}

export function TopicForm({ defaultWeek = 1, onSubmit, onCancel }: TopicFormProps) {
  const [name, setName] = useState("");
  const [week, setWeek] = useState(defaultWeek);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, week: week > 0 ? week : 1 });
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="space-y-1.5">
        <Label htmlFor="new-topic-name">Nome do assunto</Label>
        <Input
          id="new-topic-name"
          autoFocus
          placeholder="Nome do assunto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="w-64 max-w-full"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-topic-week">Semana</Label>
        <Input
          id="new-topic-week"
          type="number"
          min={1}
          value={week}
          onChange={(e) => setWeek(Number(e.target.value) || 1)}
          className="w-20"
        />
      </div>
      <Button type="submit" size="sm" disabled={!name.trim()}>
        Adicionar
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
    </form>
  );
}
