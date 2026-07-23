import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

interface SelectProps<T extends string | number> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  triggerClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  /** Renderiza o conteúdo do botão; por padrão mostra o label da opção selecionada. */
  renderTrigger?: (selected: SelectOption<T> | undefined) => ReactNode;
}

/**
 * Dropdown simples e leve (sem @radix-ui/react-select) usado tanto para o
 * seletor de status dos assuntos quanto para o seletor de semana do
 * dashboard. Fecha ao clicar fora ou ao apertar Escape.
 */
export function Select<T extends string | number>({
  value,
  options,
  onChange,
  triggerClassName,
  menuClassName,
  disabled,
  renderTrigger,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
      >
        {renderTrigger ? renderTrigger(selected) : selected?.label ?? "Selecionar"}
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 z-30 mt-1.5 min-w-[10rem] overflow-hidden rounded-md border border-border bg-surface shadow-card animate-fade-in",
            menuClassName
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover",
                option.value === value ? "text-accent" : "text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
