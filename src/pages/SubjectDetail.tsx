import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ListChecks } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopicForm } from "@/components/topics/TopicForm";
import { TopicRow } from "@/components/topics/TopicRow";
import { useAppData } from "@/hooks/useAppData";
import { useSeo } from "@/lib/seo";
import type { TopicStatus } from "@/types/store";

export default function SubjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { subjects, topics, createTopic, updateTopicStatus, deleteTopic } = useAppData();
  const subject = subjects.find((s) => s.id === id);
  const subjectTopics = topics.filter((t) => t.subjectId === id);

  useSeo(subject ? subject.name : "Matéria", "Assuntos e progresso desta matéria.");

  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!id) return null;

  const completed = subjectTopics.filter((t) => t.status === "concluido").length;
  const total = subjectTopics.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  function handleCreate(input: { name: string; week: number }) {
    createTopic({ subjectId: id!, name: input.name, week: input.week });
    setIsCreating(false);
  }

  function handleChangeStatus(topicId: string, status: TopicStatus) {
    updateTopicStatus(topicId, status);
  }

  function handleDelete(topicId: string) {
    setDeletingId(topicId);
    deleteTopic(topicId);
    setDeletingId(null);
  }

  return (
    <PageContainer
      title={subject?.name ?? "Matéria não encontrada"}
      description={subject ? `${completed}/${total} assuntos concluídos · ${progress}%` : undefined}
      actions={
        subject &&
        !isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus size={16} />
            Novo assunto
          </Button>
        )
      }
    >
      <button
        onClick={() => navigate("/materias")}
        className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Voltar para Matérias
      </button>

      {subject && (
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <div className="h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: subject.color }}
            />
          </div>
        </div>
      )}

      {isCreating && (
        <TopicForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} />
      )}

      {!subject && (
        <Card>
          <CardContent className="p-5 text-sm text-destructive">
            Esta matéria não existe ou foi excluída.
          </CardContent>
        </Card>
      )}

      {subject && subjectTopics.length === 0 && !isCreating && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-muted text-accent">
              <ListChecks size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nenhum assunto ainda</p>
              <p className="mt-1 text-sm text-muted">
                Adicione os assuntos que fazem parte de {subject.name}.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus size={16} />
              Novo assunto
            </Button>
          </CardContent>
        </Card>
      )}

      {subjectTopics.length > 0 && (
        <div className="space-y-2">
          {subjectTopics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              onChangeStatus={(status) => handleChangeStatus(topic.id, status)}
              onDelete={() => handleDelete(topic.id)}
              isDeleting={deletingId === topic.id}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
