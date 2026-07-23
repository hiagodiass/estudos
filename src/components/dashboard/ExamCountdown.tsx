import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppData } from "@/hooks/useAppData";

function formatExamDate(examDate: string) {
  return new Date(`${examDate}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ExamCountdown() {
  const { settings } = useAppData();

  if (!settings.examDate) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
          <CalendarClock size={16} />
        </div>
        <p className="text-sm text-muted">
          Nenhuma data de prova definida. Configure em{" "}
          <Link to="/configuracoes" className="underline hover:text-foreground">
            Configurações
          </Link>{" "}
          para ver a contagem regressiva aqui.
        </p>
      </Card>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDay = new Date(`${settings.examDate}T00:00:00`);
  const diffDays = Math.round((examDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-status-concluido-muted text-status-concluido">
          <CalendarClock size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">A prova já passou</p>
          <p className="text-sm text-muted">{formatExamDate(settings.examDate)}</p>
        </div>
      </Card>
    );
  }

  if (diffDays === 0) {
    return (
      <Card className="flex items-center gap-3 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-status-concluido-muted text-status-concluido">
          <CalendarClock size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">A prova é hoje!</p>
          <p className="text-sm text-muted">Boa prova 🍀</p>
        </div>
      </Card>
    );
  }

  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;

  return (
    <Card className="flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
          <CalendarClock size={16} />
        </div>
        <div>
          <p className="text-sm text-muted">Faltam para a prova</p>
          <p className="text-2xl font-semibold text-foreground">
            {weeks > 0 && (
              <>
                {weeks} {weeks === 1 ? "semana" : "semanas"}
                {days > 0 && <span className="text-lg font-normal text-muted"> e </span>}
              </>
            )}
            {(days > 0 || weeks === 0) && (
              <>
                {days} {days === 1 ? "dia" : "dias"}
              </>
            )}
          </p>
        </div>
      </div>
      <p className="shrink-0 text-right text-xs text-muted">{formatExamDate(settings.examDate)}</p>
    </Card>
  );
}