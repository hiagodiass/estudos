import type { TopicStatus } from "@/types/store";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const STATUS_ORDER: TopicStatus[] = [
  "pendente",
  "estudando",
  "revisao",
  "concluido",
];

export const STATUS_LABELS: Record<TopicStatus, string> = {
  pendente: "Pendente",
  estudando: "Estudando",
  revisao: "Revisão",
  concluido: "Concluído",
};

const STATUS_CLASSES: Record<TopicStatus, { text: string; dot: string; border: string }> = {
  pendente: {
    text: "text-status-pendente",
    dot: "bg-status-pendente",
    border: "border-status-pendente/40",
  },
  estudando: {
    text: "text-status-estudando",
    dot: "bg-status-estudando",
    border: "border-status-estudando/40",
  },
  revisao: {
    text: "text-status-revisao",
    dot: "bg-status-revisao",
    border: "border-status-revisao/40",
  },
  concluido: {
    text: "text-status-concluido",
    dot: "bg-status-concluido",
    border: "border-status-concluido/40",
  },
};

interface StatusBadgeProps {
  status: TopicStatus;
  onChange: (status: TopicStatus) => void;
  disabled?: boolean;
  className?: string;
}

/** Pill com dropdown para trocar o status de um assunto (pendente/estudando/revisão/concluído). */
export function StatusBadge({ status, onChange, disabled, className }: StatusBadgeProps) {
  const classes = STATUS_CLASSES[status];

  return (
    <Select
      value={status}
      onChange={onChange}
      disabled={disabled}
      triggerClassName={cn(classes.text, classes.border, className)}
      options={STATUS_ORDER.map((s) => ({
        value: s,
        label: (
          <span className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_CLASSES[s].dot)} />
            {STATUS_LABELS[s]}
          </span>
        ),
      }))}
      renderTrigger={() => (
        <span className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", classes.dot)} />
          {STATUS_LABELS[status]}
        </span>
      )}
    />
  );
}
