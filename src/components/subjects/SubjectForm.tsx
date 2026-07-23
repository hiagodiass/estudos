import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Paleta de cores disponível para identificar cada matéria visualmente.
// Separada das cores de status — aqui é só um marcador de identidade da matéria.
export const SUBJECT_COLORS = [
  "#5B8DEF",
  "#3DD68C",
  "#F0A93A",
  "#EF5A5A",
  "#A78BFA",
  "#F472B6",
  "#22D3EE",
  "#FACC15",
];

interface SubjectFormProps {
  initialName?: string;
  initialColor?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (input: { name: string; color: string }) => void;
  onCancel: () => void;
}

export function SubjectForm({
  initialName = "",
  initialColor = SUBJECT_COLORS[0],
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: SubjectFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, color });
  }

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject-name">Nome da matéria</Label>
            <Input
              id="subject-name"
              autoFocus
              placeholder="Ex: Direito Constitucional"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-label={`Selecionar cor ${option}`}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-opacity",
                    color === option ? "opacity-100" : "opacity-60 hover:opacity-100"
                  )}
                  style={{ backgroundColor: option }}
                >
                  {color === option && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" size="sm" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Salvando..." : submitLabel}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}