import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { HeartHandshake, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAcademic } from "@/components/academic/store";
import { STUDENTS, type CareNote } from "@/components/academic/data";

export const Route = createFileRoute("/_app/academic/care")({
  component: AcademicCare,
});

function AcademicCare() {
  const { students, careNotes, setCareNotes, settings, logAudit } = useAcademic();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", author: "", role: "", note: "", action: "" });

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? "General";

  const watchlist = useMemo(
    () =>
      students.filter(
        (s) => s.attendance < settings.threshold || s.gpa < 6,
      ).sort((a, b) => a.attendance - b.attendance).slice(0, 20),
    [students, settings.threshold],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.note || !form.author) return;
    const note: CareNote = {
      id: `cn${Date.now()}`,
      studentId: form.studentId,
      author: form.author,
      role: form.role || "Staff",
      note: form.note,
      action: form.action || "Follow-up",
      date: new Date().toISOString().slice(0, 10),
    };
    setCareNotes((prev) => [note, ...prev]);
    logAudit("ADD_CARE_NOTE", `${studentName(note.studentId)} — ${note.action}`);
    toast.success("Care note added");
    setForm({ studentId: "", author: "", role: "", note: "", action: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Care & Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">Students needing support and the interventions logged for them</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus className="size-4" /> Add Care Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <h3 className="text-sm font-semibold">Watchlist — {watchlist.length} students</h3>
          </div>
          <div className="px-5 py-2 text-xs text-muted-foreground border-b border-border bg-muted/30">
            Attendance below {settings.threshold}% or GPA below 6.0
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold px-4 py-2.5">Student</th>
                <th className="text-left font-semibold px-4 py-2.5 w-24">Course</th>
                <th className="text-right font-semibold px-4 py-2.5 w-24">Attend.</th>
                <th className="text-right font-semibold px-4 py-2.5 w-20">GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {watchlist.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.id} · {s.year}</div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.course}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${s.attendance < settings.threshold ? "text-rose-600" : ""}`}>{s.attendance}%</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${s.gpa < 6 ? "text-rose-600" : ""}`}>{s.gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <HeartHandshake className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Care Notes & Interventions</h3>
          </div>
          <ul className="divide-y divide-border">
            {careNotes.map((n) => (
              <li key={n.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{studentName(n.studentId)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {n.author} · {n.role} · {n.date}
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-medium">
                    {n.action}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{n.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-semibold">Add Care Note</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Student (optional)</label>
              <select value={form.studentId} onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
                className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">General</option>
                {STUDENTS.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.id}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Recorded by</label>
                <input value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Class Mentor" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Intervention</label>
              <input value={form.action} onChange={(e) => setForm((p) => ({ ...p, action: e.target.value }))}
                className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. Guardian contacted" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Note</label>
              <textarea value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={3}
                className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save Note</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
