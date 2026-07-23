import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Settings, GraduationCap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/hooks/useAppData";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/materias", label: "Matérias", icon: BookOpen, end: false },
  { to: "/configuracoes", label: "Configurações", icon: Settings, end: false },
];

export function Sidebar() {
  const { streak } = useAppData();

  const hasActiveStreak = streak.count > 0;

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-muted text-accent">
          <GraduationCap size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">EstudoFlow</p>
          <p className="text-xs text-muted-foreground">Foco no que importa</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-muted text-accent"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )
            }
          >
            <Icon size={16} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 mb-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              hasActiveStreak ? "bg-amber-500/15 text-amber-400" : "bg-surface-hover text-muted"
            )}
          >
            <Flame size={16} />
          </div>
          <p className="text-sm font-medium text-foreground">Streak</p>
        </div>
        <p className="mt-2 text-xl font-semibold text-foreground">
          {streak.count} <span className="text-sm font-normal text-muted">dias</span>
        </p>
        <p className="mt-1 text-xs text-muted">
          {hasActiveStreak
            ? "Estude hoje pra manter a sequência."
            : "Conclua um assunto hoje para começar sua sequência."}
        </p>
      </div>

      <div className="px-5 py-4 text-xs text-muted-foreground">
        <p>Versão 0.2 · Uso local</p>
      </div>
    </aside>
  );
}
