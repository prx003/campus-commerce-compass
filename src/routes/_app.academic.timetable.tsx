import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAcademic } from "@/components/academic/store";
import { COURSES, DAYS, PERIOD_TIMES, type Slot } from "@/components/academic/data";

export const Route = createFileRoute("/_app/academic/timetable")({
  component: AcademicTimetable,
});

const SLOT_STYLE: Record<string, string> = {
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  lime: "bg-lime-50 text-lime-700 border-lime-200",
};

const COLOR_KEYS = ["sky", "emerald", "amber", "violet", "rose", "cyan"];

function AcademicTimetable() {
  const { slots, setSlots, logAudit } = useAcademic();
  const [course, setCourse] = useState<string>("B.Sc");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", instructor: "", room: "", day: "0", period: "1" });

  const visible = useMemo(
    () => slots.filter((s) => s.course === course),
    [slots, course],
  );

  const cell = (day: number, period: number) => visible.find((s) => s.day === day && s.period === period);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.instructor) return;
    const slot: Slot = {
      id: `s${Date.now()}`,
      day: Number(form.day),
      period: Number(form.period),
      course,
      subject: form.subject,
      instructor: form.instructor,
      room: form.room,
      color: COLOR_KEYS.indexOf(COLOR_KEYS[slots.length % COLOR_KEYS.length]),
    };
    setSlots((prev) => [...prev.filter((p) => !(p.day === slot.day && p.period === slot.period && p.course === course)), slot]);
    logAudit("SCHEDULE_SLOT", `${course} — ${slot.subject} (${DAYS[slot.day]} P${slot.period})`);
    toast.success("Class scheduled");
    setForm({ subject: "", instructor: "", room: "", day: "0", period: "1" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-1">Weekly class schedule per programme</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus className="size-4" /> Add Class
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {COURSES.map((c) => (
          <button
            key={c}
            onClick={() => setCourse(c)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition",
              course === c ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border hover:bg-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-x-auto">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{course} — Weekly Timetable</h3>
        </div>
        <table className="w-full text-sm min-w-[860px]">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5 w-32">Period</th>
              {DAYS.map((d) => (
                <th key={d} className="text-left font-semibold px-4 py-2.5">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
              <tr key={period}>
                <td className="px-4 py-2 align-top">
                  <div className="font-medium">P{period}</div>
                  <div className="text-[11px] text-muted-foreground">{PERIOD_TIMES[period]}</div>
                </td>
                {DAYS.map((_, day) => {
                  const s = cell(day, period);
                  return (
                    <td key={day} className="px-2 py-2 align-top">
                      {s ? (
                        <div className={cn("rounded-lg border px-3 py-2", SLOT_STYLE[Object.keys(SLOT_STYLE)[s.color] ?? "sky"])}>
                          <div className="text-xs font-semibold leading-tight">{s.subject}</div>
                          <div className="text-[11px] mt-1 opacity-80">{s.instructor}</div>
                          <div className="text-[11px] opacity-70">{s.room}</div>
                        </div>
                      ) : (
                        <div className="h-[52px] rounded-lg border border-dashed border-border/60" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-md bg-card rounded-xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h3 className="text-base font-semibold">Add Class — {course}</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Instructor</label>
              <input value={form.instructor} onChange={(e) => setForm((p) => ({ ...p, instructor: e.target.value }))}
                className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Room</label>
              <input value={form.room} onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. S-101" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Day</label>
                <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Period</label>
                <select value={form.period} onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => <option key={p} value={p}>P{p} ({PERIOD_TIMES[p]})</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="h-9 px-4 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancel</button>
              <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Schedule</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
