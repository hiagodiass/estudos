import { useMemo, useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { subjectKey } from "@/lib/api";
import { parseTopicList } from "@/lib/topicImport";
import type { Subject, Topic } from "@/types/store";

interface ImportTopicsDialogProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  topics: Topic[];
  defaultWeek: number;
  onImport: (
    inputs: { subjectId: string; name: string; week: number }[]
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const PLACEHOLDER = `S1
Conceitos de Segurança da Informação
Ameaças (Vírus, Worms, Trojans...)

S2 · SEMA
4. Algoritmos de Criptografia
5. Hashes Criptográficos`;

export function ImportTopicsDialog({
  open,
  onClose,
  subjects,
  topics,
  defaultWeek,
  onImport,
}: ImportTopicsDialogProps) {
  // Lista de TI é o caso mais comum; cai para a primeira matéria se não houver.
  const preferredSubjectId =
    subjects.find((s) => subjectKey(s.name) === "ti")?.id ?? subjects[0]?.id ?? "";
  const [subjectId, setSubjectId] = useState("");
  const [text, setText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSubjectId = subjectId || preferredSubjectId;

  const parsed = useMemo(
    () => parseTopicList(text, subjects, topics, effectiveSubjectId, defaultWeek),
    [text, subjects, topics, effectiveSubjectId, defaultWeek]
  );
  const toImport = parsed.filter((t) => !t.duplicate);
  const duplicates = parsed.length - toImport.length;

  const byWeek = useMemo(() => {
    const counts = new Map<number, number>();
    for (const t of toImport) counts.set(t.week, (counts.get(t.week) ?? 0) + 1);
    return Array.from(counts).sort(([a], [b]) => a - b);
  }, [toImport]);

  function handleClose() {
    if (isSaving) return;
    setText("");
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (toImport.length === 0) return;
    setIsSaving(true);
    setError(null);
    const result = await onImport(
      toImport.map(({ subjectId, name, week }) => ({ subjectId, name, week }))
    );
    setIsSaving(false);
    if (result.ok) {
      setText("");
      onClose();
    } else {
      setError(result.error);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Importar lista de assuntos"
      description="Cole a lista com cabeçalhos de semana (S1, S2 · SEMA...) e um assunto por linha."
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="import-subject">Matéria</Label>
          <select
            id="import-subject"
            value={effectiveSubjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:border-accent"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">
            Linhas no formato "Matéria: assunto" usam a matéria indicada.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="import-text">Lista</Label>
          <textarea
            id="import-text"
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={10}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted transition-colors focus-visible:outline-none focus-visible:border-accent"
          />
        </div>

        {parsed.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-hover/40 p-3 text-xs">
            <p className="font-medium text-foreground">
              {toImport.length} assunto{toImport.length === 1 ? "" : "s"} para importar
            </p>
            {byWeek.length > 0 && (
              <p className="mt-1 text-muted">
                {byWeek.map(([week, count]) => `S${week}: ${count}`).join(" · ")}
              </p>
            )}
            {duplicates > 0 && (
              <p className="mt-1 text-muted">
                {duplicates} já cadastrado{duplicates === 1 ? "" : "s"} na mesma semana — será
                {duplicates === 1 ? "" : "o"} ignorado{duplicates === 1 ? "" : "s"}.
              </p>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" disabled={toImport.length === 0 || isSaving}>
            {isSaving ? "Importando..." : `Importar ${toImport.length || ""}`.trim()}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
