import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, GraduationCap, Download, Upload, Target, Calendar } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAppData } from "@/hooks/useAppData";
import { getWeeklyGoal } from "@/lib/store";
import { useSeo } from "@/lib/seo";

const CONFIRM_WORD = "apagar";

export default function Settings() {
  useSeo("Configurações", "Preferências e dados do EstudoH.");

  const {
    subjects,
    topics,
    settings,
    updateSettings,
    setWeeklyGoalForWeek,
    resetAll,
    exportData,
    importData,
  } = useAppData();

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [defaultGoalInput, setDefaultGoalInput] = useState(String(settings.weeklyGoal));
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSubjects = subjects.length;
  const totalTopics = topics.length;
  const canConfirm = confirmText.trim().toLowerCase() === CONFIRM_WORD;

  // ---- Meta padrão (usada por semanas sem meta própria) ----

  function handleSaveDefaultGoal() {
    const parsed = Number(defaultGoalInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    updateSettings({ weeklyGoal: Math.round(parsed) });
  }

  // ---- Meta individual por semana ----

  const weeks = useMemo(() => {
    const set = new Set<number>(topics.map((t) => t.week));
    set.add(1);
    return Array.from(set).sort((a, b) => a - b);
  }, [topics]);

  const [selectedGoalWeek, setSelectedGoalWeek] = useState(weeks[0]);
  const currentGoalWeek = weeks.includes(selectedGoalWeek) ? selectedGoalWeek : weeks[0];
  const hasWeekOverride = settings.weeklyGoalsByWeek[currentGoalWeek] !== undefined;

  const [weekGoalInput, setWeekGoalInput] = useState(
    String(getWeeklyGoal(settings, currentGoalWeek))
  );

  // Sempre que a semana selecionada (ou as metas) mudar, atualiza o campo
  // para mostrar a meta efetiva daquela semana.
  useEffect(() => {
    setWeekGoalInput(String(getWeeklyGoal(settings, currentGoalWeek)));
  }, [currentGoalWeek, settings]);

  function handleSaveWeekGoal() {
    const parsed = Number(weekGoalInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setWeeklyGoalForWeek(currentGoalWeek, Math.round(parsed));
  }

  function handleUseDefaultForWeek() {
    setWeeklyGoalForWeek(currentGoalWeek, 0);
  }

  // ---- Data da prova ----

  const [examDateInput, setExamDateInput] = useState(settings.examDate ?? "");

  function handleSaveExamDate() {
    updateSettings({ examDate: examDateInput || null });
  }

  function formatExamDateLabel(examDate: string) {
    return new Date(`${examDate}T00:00:00`).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function handleCancelReset() {
    setIsConfirming(false);
    setConfirmText("");
  }

  async function handleConfirmDelete() {
    if (!canConfirm || isResetting) return;
    setIsResetting(true);
    setResetError(null);
    setResetSuccess(false);
    const result = await resetAll();
    setIsResetting(false);
    setIsConfirming(false);
    setConfirmText("");
    if (result.ok) setResetSuccess(true);
    else setResetError(result.error);
  }

  async function handleExport() {
    setExportError(null);
    const result = await exportData();
    if (!result.ok) {
      setExportError(result.error);
      return;
    }
    const json = result.json;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `estudoH-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError(null);
    setImportSuccess(false);
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result ?? "");
      const result = await importData(text);
      if (result.ok) {
        setImportError(null);
        setImportSuccess(true);
      } else {
        setImportSuccess(false);
        setImportError(result.error);
      }
    };
    reader.onerror = () => setImportError("Não foi possível ler o arquivo selecionado.");
    reader.readAsText(file);
  }

  return (
    <PageContainer title="Configurações" description="Preferências do sistema.">
      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
            <GraduationCap size={16} />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">EstudoH</p>
            <p className="text-muted">Versão 0.2 · Online</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data da prova</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted">
            Define a data da sua prova pra ver a contagem regressiva (semanas e dias) no
            Dashboard.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
              <Calendar size={16} />
            </div>
            <Input
              type="date"
              value={examDateInput}
              onChange={(e) => setExamDateInput(e.target.value)}
              className="max-w-[10rem]"
            />
            <Button size="sm" onClick={handleSaveExamDate}>
              Salvar
            </Button>
          </div>
          {settings.examDate && (
            <p className="text-xs text-muted">
              Prova marcada para {formatExamDateLabel(settings.examDate)}.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta semanal padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted">
            Quantidade de assuntos por semana usada como padrão para semanas que não
            tiverem uma meta própria definida abaixo.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
              <Target size={16} />
            </div>
            <Input
              type="number"
              min={1}
              value={defaultGoalInput}
              onChange={(e) => setDefaultGoalInput(e.target.value)}
              className="max-w-[7rem]"
            />
            <Button size="sm" onClick={handleSaveDefaultGoal}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meta semanal por semana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted">
            Defina uma meta diferente para uma semana específica (ex: 28 na semana 1 e
            30 na semana 2). Semanas sem meta própria usam a meta padrão acima.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={currentGoalWeek}
              onChange={setSelectedGoalWeek}
              options={weeks.map((w) => ({ value: w, label: `Semana ${w}` }))}
              renderTrigger={() => (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Semana {currentGoalWeek}
                </span>
              )}
            />
            <Input
              type="number"
              min={1}
              value={weekGoalInput}
              onChange={(e) => setWeekGoalInput(e.target.value)}
              className="max-w-[7rem]"
            />
            <Button size="sm" onClick={handleSaveWeekGoal}>
              Salvar meta da semana
            </Button>
            {hasWeekOverride && (
              <Button size="sm" variant="ghost" onClick={handleUseDefaultForWeek}>
                Usar meta padrão
              </Button>
            )}
          </div>
          <p className="text-xs text-muted">
            {hasWeekOverride
              ? `A semana ${currentGoalWeek} tem uma meta própria definida.`
              : `A semana ${currentGoalWeek} está usando a meta padrão.`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup dos dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">
            Exporte todos os seus dados (matérias com os seus assuntos, streak e
            configurações) em um arquivo JSON, ou importe um backup salvo anteriormente.
            A importação substitui os dados atuais.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleExport}>
              <Download size={14} />
              Exportar JSON
            </Button>
            <Button size="sm" variant="secondary" onClick={handleImportClick}>
              <Upload size={14} />
              Importar JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {importSuccess && (
            <p className="text-sm text-status-concluido">Dados importados com sucesso.</p>
          )}
          {importError && <p className="text-sm text-destructive">{importError}</p>}
          {exportError && (
            <p className="text-sm text-destructive">Erro ao exportar: {exportError}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de perigo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">
            Apaga permanentemente todos os assuntos, as matérias, a streak, as revisões
            agendadas, a data da prova e as metas. As matérias fixas (Português,
            Raciocínio Lógico e TI) continuam, mas ficam vazias. Essa ação não pode ser
            desfeita.
          </p>

          {!isConfirming ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setResetError(null);
                setResetSuccess(false);
                setIsConfirming(true);
              }}
            >
              <AlertTriangle size={14} />
              Apagar todos os dados
            </Button>
          ) : (
            <div className="space-y-3 rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-foreground">
                Digite <span className="font-mono font-semibold">{CONFIRM_WORD}</span> para
                confirmar a exclusão de {totalTopics}{" "}
                {totalTopics === 1 ? "assunto" : "assuntos"}, das matérias não fixas
                ({totalSubjects} no total, contando as fixas) e de todas as configurações.
              </p>

              <Label htmlFor="confirm-delete" className="sr-only">
                Confirmação
              </Label>
              <Input
                id="confirm-delete"
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_WORD}
                className="max-w-xs"
              />

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={!canConfirm || isResetting}
                  onClick={handleConfirmDelete}
                >
                  {isResetting ? "Apagando..." : "Confirmar exclusão"}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelReset}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          {resetSuccess && (
            <p className="text-sm text-status-concluido">Dados apagados com sucesso.</p>
          )}
          {resetError && (
            <p className="text-sm text-destructive">
              Erro ao apagar: {resetError}. Parte dos dados pode ter sido apagada; tente de novo.
            </p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}