import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { STATUS_LABELS, STATUS_ORDER } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { TopicStatus } from "@/types/store";

// Cores em hex (não classes Tailwind) porque o atributo `stroke` do SVG
// precisa de um valor de cor direto — mantidas em sincronia com as mesmas
// cores de `tailwind.config.js` (status.*).
const STATUS_STROKE: Record<TopicStatus, string> = {
  pendente: "#6B7280",
  estudando: "#5B8DEF",
  revisao: "#F0A93A",
  concluido: "#34D399",
};

const STATUS_DOT_CLASSES: Record<TopicStatus, string> = {
  pendente: "bg-status-pendente",
  estudando: "bg-status-estudando",
  revisao: "bg-status-revisao",
  concluido: "bg-status-concluido",
};

const SIZE = 132;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface StatusOverviewProps {
  counts: Record<TopicStatus, number>;
  total: number;
}

/** Distribuição de assuntos por status: gráfico de rosca (SVG puro) + legenda com contagens. */
export function StatusOverview({ counts, total }: StatusOverviewProps) {
  const completedPct = total > 0 ? Math.round((counts.concluido / total) * 100) : 0;

  // Acumula o deslocamento de cada fatia ao longo do perímetro do círculo,
  // desenhando uma por cima da outra via stroke-dasharray/offset.
  let cumulative = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assuntos por status</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted">Nenhum assunto cadastrado ainda.</p>
        ) : (
          <div className="flex items-center gap-6">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
              {/* Rotaciona só os círculos (não o texto) para a primeira fatia começar no topo */}
              <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
                <circle
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  strokeWidth={STROKE_WIDTH}
                  className="stroke-border"
                />
                {STATUS_ORDER.map((status) => {
                  const count = counts[status];
                  if (count === 0) return null;
                  const dash = (count / total) * CIRCUMFERENCE;
                  const offset = cumulative;
                  cumulative += dash;
                  return (
                    <circle
                      key={status}
                      cx={SIZE / 2}
                      cy={SIZE / 2}
                      r={RADIUS}
                      fill="none"
                      stroke={STATUS_STROKE[status]}
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
              </g>

              <text
                x={SIZE / 2}
                y={SIZE / 2 - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current text-xl font-semibold text-foreground"
              >
                {completedPct}%
              </text>
              <text
                x={SIZE / 2}
                y={SIZE / 2 + 16}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current text-[11px] text-muted"
              >
                concluído
              </text>
            </svg>

            <ul className="flex-1 space-y-2.5">
              {STATUS_ORDER.map((status) => (
                <li key={status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <span className={cn("h-2 w-2 rounded-full", STATUS_DOT_CLASSES[status])} />
                    {STATUS_LABELS[status]}
                  </div>
                  <span className="text-muted">{counts[status]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}