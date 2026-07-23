import { useState } from "react";
import { Plus, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubjectForm } from "@/components/subjects/SubjectForm";
import { SubjectCard } from "@/components/subjects/SubjectCard";
import { useAppData } from "@/hooks/useAppData";
import { useSeo } from "@/lib/seo";
import type { Subject } from "@/types/store";

export default function Subjects() {
  useSeo("Matérias", "Suas matérias e assuntos de estudo.");

  const { subjects, topics, createSubject, updateSubject, deleteSubject } = useAppData();

  const [isCreating, setIsCreating] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function progressFor(subjectId: string) {
    const items = topics.filter((t) => t.subjectId === subjectId);
    const completed = items.filter((t) => t.status === "concluido").length;
    return { total: items.length, completed };
  }

  function handleCreate(input: { name: string; color: string }) {
    createSubject(input);
    setIsCreating(false);
  }

  function handleUpdate(input: { name: string; color: string }) {
    if (!editingSubject) return;
    updateSubject(editingSubject.id, input);
    setEditingSubject(null);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteSubject(id);
    setDeletingId(null);
  }

  return (
    <PageContainer
      title="Matérias"
      description="Suas matérias e assuntos de estudo."
      actions={
        !isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={16} />
            Nova matéria
          </Button>
        )
      }
    >
      {isCreating && (
        <SubjectForm
          submitLabel="Criar matéria"
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {subjects.length === 0 && !isCreating && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-accent">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nenhuma matéria ainda</p>
              <p className="mt-1 text-sm text-muted">
                Crie sua primeira matéria para começar a organizar seus estudos.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus size={16} />
              Nova matéria
            </Button>
          </CardContent>
        </Card>
      )}

      {subjects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) =>
            editingSubject?.id === subject.id ? (
              <SubjectForm
                key={subject.id}
                initialName={subject.name}
                initialColor={subject.color}
                submitLabel="Salvar alterações"
                onSubmit={handleUpdate}
                onCancel={() => setEditingSubject(null)}
              />
            ) : (
              <SubjectCard
                key={subject.id}
                subject={subject}
                totalTopics={progressFor(subject.id).total}
                completedTopics={progressFor(subject.id).completed}
                onEdit={() => setEditingSubject(subject)}
                onDelete={() => handleDelete(subject.id)}
                isDeleting={deletingId === subject.id}
              />
            )
          )}
        </div>
      )}
    </PageContainer>
  );
}
