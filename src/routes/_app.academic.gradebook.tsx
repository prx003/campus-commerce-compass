import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpenCheck, Save } from "lucide-react";
import { toast } from "sonner";
import { useAcademic } from "@/components/academic/store";
import { COURSES, STUDENTS, type TestType } from "@/components/academic/data";

const TEST_TYPES: TestType[] = ["Term Test", "Midterm", "Final"];

export const Route = createFileRoute("/_app/academic/gradebook")({
  component: AcademicGradebook,
});

function gradeOf(pct: number) {
  if (pct >= 90) return { label: "A+", cls: "text-emerald-600" };
  if (pct >= 80) return { label: "A", cls: "text-emerald-600" };
  if (pct >= 70) return { label: "B", cls: "text-sky-600" };
  if (pct >= 60) return { label: "C", cls: "text-amber-600" };
  if (pct >= 50) return { label: "D", cls: "text-orange-600" };
  return { label: "F", cls: "text-rose-600" };
}

function AcademicGradebook() {
  const { grades, setGrades, logAudit } = useAcademic();
  const [course, setCourse] = useState<string>("B.Sc");
  const [testType, setTestType] = useState<TestType>("Term Test");

  const roster = useMemo(() => STUDENTS.filter((s) => s.course === course), [course]);

  const marksFor = (studentId: string): string => {
    const g = grades.find((x) => x.studentId === studentId && x.course === course && x.testType === testType);
    return g ? String(g.marks) : "";
  };

  const setMark = (studentId: string, raw: string) => {
    const num = raw === "" ? null : Math.max(0, Math.min(100, Number(raw)));
    setGrades((prev) => {
      const idx = prev.findIndex((x) => x.studentId === studentId && x.course === course && x.testType === testType);
      if (num === null) {
        if (idx < 0) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      }
      const entry = { id: `g${studentId}-${testType}`, studentId, course, testType, marks: num, max: 100 };
      if (idx < 0) return [...prev, entry];
      const next = [...prev];
      next[idx] = { ...next[idx], marks: num };
      return next;
    });
  };

  const entered = roster.filter((s) => marksFor(s.id) !== "");
  const average = entered.length > 0
    ? Math.round(entered.reduce((acc, s) => acc + Number(marksFor(s.id)), 0) / entered.length)
    : null;

  const save = () => {
    logAudit("UPDATE_GRADES", `${course} — ${testType} (${entered.length} entries)`);
    toast.success(`Saved ${testType} marks for ${course}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gradebook</h1>
          <p className="text-sm text-muted-foreground mt-1">Record and review internal assessment marks</p>
        </div>
        <button
          onClick={save}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Save className="size-4" /> Save Marks
        </button>
      </div>

      <div className="rounded-xl bg-card border border-border p-5 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course</label>
          <select value={course} onChange={(e) => setCourse(e.target.value)}
            className="mt-1.5 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {COURSES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assessment</label>
          <select value={testType} onChange={(e) => setTestType(e.target.value as TestType)}
            className="mt-1.5 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {TEST_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <div className="rounded-lg bg-muted/50 px-4 py-2.5 w-full">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class average</div>
            <div className="text-lg font-bold tabular-nums">{average === null ? "—" : `${average} / 100`}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <BookOpenCheck className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{course} — {testType} ({entered.length}/{roster.length} entered)</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Student</th>
              <th className="text-left font-semibold px-4 py-2.5 w-24">ID</th>
              <th className="text-left font-semibold px-4 py-2.5 w-32">Marks (0–100)</th>
              <th className="text-left font-semibold px-4 py-2.5 w-20">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roster.map((s) => {
              const raw = marksFor(s.id);
              const g = raw === "" ? null : gradeOf(Number(raw));
              return (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{s.id}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number" min={0} max={100}
                      value={raw}
                      onChange={(e) => setMark(s.id, e.target.value)}
                      placeholder="—"
                      className="w-24 h-9 px-2.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </td>
                  <td className={`px-4 py-2.5 font-semibold ${g?.cls ?? "text-muted-foreground"}`}>{g?.label ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
