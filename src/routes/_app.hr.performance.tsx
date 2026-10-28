import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, Plus, X, Download } from "lucide-react";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/hr/layout";
import { useHR, type Evaluation } from "@/components/hr/store";
import { exportCSV } from "@/components/hr/export";

export const Route = createFileRoute("/_app/hr/performance")({
  component: () => (
    <ModuleGuard module="performance">
      <Performance />
    </ModuleGuard>
  ),
});

function Performance() {
  const { employees, evaluations, addEvaluation } = useHR();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    empId: employees[0]?.id ?? "",
    period: "Q4 2025",
    kpi: 80,
    goals: 80,
    rating: "Meets" as Evaluation["rating"],
    note: "",
  });

  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? id;
  const avgKpi = evaluations.length ? Math.round(evaluations.reduce((s, e) => s + e.kpi, 0) / evaluations.length) : 0;
  const top = [...evaluations].sort((a, b) => b.kpi - a.kpi)[0];

  const ratingColor = (r: Evaluation["rating"]) =>
    r === "Outstanding" ? "bg-success/10 text-success"
    : r === "Exceeds" ? "bg-primary/10 text-primary"
    : r === "Meets" ? "bg-secondary text-foreground"
    : "bg-destructive/10 text-destructive";

  const submit = () => {
    addEvaluation(form);
    setOpen(false);
    setForm({ ...form, note: "" });
  };

  const download = () =>
    exportCSV(
      "performance-report",
      ["Employee", "Period", "KPI %", "Goals %", "Rating", "Note"],
      evaluations.map((e) => [nameOf(e.empId), e.period, e.kpi, e.goals, e.rating, e.note]),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Management"
        subtitle="KPI tracking & evaluations"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={download}><Download className="size-4" /> Export</Button>
            <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> New evaluation</Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Avg KPI" value={`${avgKpi}%`} icon={Gauge} accent="success" />
        <StatCard label="Evaluations" value={String(evaluations.length)} icon={Gauge} />
        <StatCard label="Top performer" value={top ? nameOf(top.empId).split(" ")[0] : "—"} icon={Gauge} accent="primary" />
      </div>

      <Section title="Evaluations">
        <div className="space-y-3">
          {evaluations.map((e) => (
            <div key={e.id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">{nameOf(e.empId)}</div>
                  <div className="text-[11px] text-muted-foreground">{e.period}</div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${ratingColor(e.rating)}`}>{e.rating}</span>
              </div>
              <Bar label="KPI" value={e.kpi} />
              <Bar label="Goals" value={e.goals} />
              {e.note && <p className="text-xs text-muted-foreground mt-2">{e.note}</p>}
            </div>
          ))}
        </div>
      </Section>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-card p-6" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">New Evaluation</h3>
              <button onClick={() => setOpen(false)} className="size-8 grid place-items-center rounded hover:bg-secondary"><X className="size-4" /></button>
            </div>
            <div className="space-y-3">
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Employee</span>
                <select className="inp mt-1" value={form.empId} onChange={(e) => setForm({ ...form, empId: e.target.value })}>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Period</span><input className="inp mt-1" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-xs font-medium text-muted-foreground">KPI %</span><input type="number" className="inp mt-1" value={form.kpi} onChange={(e) => setForm({ ...form, kpi: Number(e.target.value) })} /></label>
                <label className="block"><span className="text-xs font-medium text-muted-foreground">Goals %</span><input type="number" className="inp mt-1" value={form.goals} onChange={(e) => setForm({ ...form, goals: Number(e.target.value) })} /></label>
              </div>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Rating</span>
                <select className="inp mt-1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value as Evaluation["rating"] })}>
                  <option>Outstanding</option><option>Exceeds</option><option>Meets</option><option>Needs Improvement</option>
                </select>
              </label>
              <label className="block"><span className="text-xs font-medium text-muted-foreground">Note</span><textarea className="inp mt-1" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={submit}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 mt-1.5">
      <span className="text-[11px] text-muted-foreground w-10">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: "var(--chart-1)" }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums w-9 text-right">{value}%</span>
    </div>
  );
}
