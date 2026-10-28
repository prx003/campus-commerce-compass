import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardCheck, CheckCircle2, XCircle, Clock3, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAcademic } from "@/components/academic/store";
import { COURSES, YEARS, STUDENTS, type AttStatus } from "@/components/academic/data";

export const Route = createFileRoute("/_app/academic/attendance")({
  component: AcademicAttendance,
});

const STATUSES: AttStatus[] = ["Present", "Absent", "Late", "Excused"];

const STATUS_STYLE: Record<AttStatus, string> = {
  Present: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Absent: "bg-rose-50 text-rose-700 border-rose-200",
  Late: "bg-amber-50 text-amber-700 border-amber-200",
  Excused: "bg-sky-50 text-sky-700 border-sky-200",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function AcademicAttendance() {
  const { attendance, setAttendance, logAudit } = useAcademic();
  const [course, setCourse] = useState<string>("B.Sc");
  const [year, setYear] = useState<string>("1st Year");
  const [date, setDate] = useState(today());

  const roster = useMemo(
    () => STUDENTS.filter((s) => s.course === course && s.year === year),
    [course, year],
  );

  const statusFor = (studentId: string): AttStatus | null => {
    const rec = attendance.find((a) => a.date === date && a.course === course && a.year === year && a.studentId === studentId);
    return rec ? rec.status : null;
  };

  const counts = useMemo(() => {
    const c: Record<AttStatus, number> = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    for (const s of roster) {
      const st = statusFor(s.id);
      if (st) c[st]++;
    }
    return c;
  }, [attendance, course, year, date, roster]); // eslint-disable-line react-hooks/exhaustive-deps

  const mark = (studentId: string, status: AttStatus) => {
    setAttendance((prev) => {
      const idx = prev.findIndex((a) => a.date === date && a.course === course && a.year === year && a.studentId === studentId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], status };
        return next;
      }
      return [...prev, { id: `ar${Date.now()}`, date, course, year, studentId, status }];
    });
  };

  const saveAll = () => {
    const missing = roster.filter((s) => !statusFor(s.id));
    if (missing.length > 0) {
      setAttendance((prev) => [
        ...prev,
        ...missing.map((s, i) => ({ id: `ar${Date.now()}-${i}`, date, course, year, studentId: s.id, status: "Absent" as AttStatus })),
      ]);
    }
    logAudit("SAVE_ATTENDANCE", `${course} ${year} — ${date}`);
    toast.success(`Attendance saved for ${roster.length} students`);
  };

  const markAll = (status: AttStatus) => {
    roster.forEach((s) => mark(s.id, status));
    toast.success(`Marked all as ${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Mark and review daily attendance per class</p>
        </div>
        <button
          onClick={saveAll}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <ClipboardCheck className="size-4" /> Save Attendance
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
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="mt-1.5 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATUSES.map((st) => (
          <div key={st} className="rounded-xl bg-card border border-border p-4 shadow-sm flex items-center gap-3">
            <div className={cn("size-10 rounded-lg grid place-items-center border", STATUS_STYLE[st])}>
              {st === "Present" && <CheckCircle2 className="size-5" />}
              {st === "Absent" && <XCircle className="size-5" />}
              {st === "Late" && <Clock3 className="size-5" />}
              {st === "Excused" && <ShieldCheck className="size-5" />}
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{st}</div>
              <div className="text-xl font-bold tabular-nums">{counts[st]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">{course} — {year} · {date}</h3>
          <div className="flex gap-2">
            <button onClick={() => markAll("Present")} className="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-muted">Mark all present</button>
            <button onClick={() => markAll("Absent")} className="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-muted">Mark all absent</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Student</th>
              <th className="text-left font-semibold px-4 py-2.5 w-24">ID</th>
              <th className="text-right font-semibold px-4 py-2.5 w-80">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roster.map((s) => {
              const st = statusFor(s.id);
              return (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{s.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{s.id}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      {STATUSES.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => mark(s.id, opt)}
                          className={cn(
                            "px-2.5 h-7 rounded-md border text-xs font-medium transition",
                            st === opt ? STATUS_STYLE[opt] : "border-border text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
