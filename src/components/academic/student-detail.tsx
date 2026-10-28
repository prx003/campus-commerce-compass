import { X, Mail, Phone, IdCard, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Student } from "./data";

export function StudentDetail({ student, onClose }: { student: Student; onClose: () => void }) {
  const attOk = student.attendance >= 75;
  const totalMarks = student.subjects.reduce((a, s) => a + s.marks, 0);
  const totalMax = student.subjects.reduce((a, s) => a + s.max, 0);
  const pct = Math.round((totalMarks / totalMax) * 100);
  const tag = pct >= 75 ? { label: "Good", cls: "bg-green-100 text-green-700" } : pct >= 55 ? { label: "Average", cls: "bg-amber-100 text-amber-700" } : { label: "At Risk", cls: "bg-red-100 text-red-700" };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-[640px] bg-card border-l border-border h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Student Detail</div>
            <div className="text-base font-semibold">{student.name}</div>
          </div>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-md hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic info */}
          <section className="flex gap-4">
            <div className="size-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center text-2xl font-semibold shrink-0">
              {student.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1 space-y-1.5 text-sm">
              <div className="text-lg font-semibold">{student.name}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><IdCard className="size-3.5" /> {student.id}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><GraduationCap className="size-3.5" /> {student.course} · {student.year}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3.5" /> {student.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5" /> {student.phone}</div>
            </div>
          </section>

          {/* Attendance */}
          <section className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Attendance</h3>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold tabular-nums ${attOk ? "text-green-600" : "text-red-600"}`}>{student.attendance}%</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${attOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {attOk ? "Above 75%" : "Below 75%"}
                </span>
              </div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={student.monthlyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="pct" fill={attOk ? "#16a34a" : "#dc2626"} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Academic performance */}
          <section className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Academic Performance</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${tag.cls}`}>{tag.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">GPA</div>
                <div className="text-xl font-bold tabular-nums">{student.gpa}</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">CGPA</div>
                <div className="text-xl font-bold tabular-nums">{student.cgpa}</div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Subject</th>
                  <th className="text-right py-2 font-medium">Marks</th>
                  <th className="text-right py-2 font-medium">Out of</th>
                </tr>
              </thead>
              <tbody>
                {student.subjects.map((s) => (
                  <tr key={s.name} className="border-b border-border/60 last:border-0">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2 text-right tabular-nums font-semibold">{s.marks}</td>
                    <td className="py-2 text-right tabular-nums text-muted-foreground">{s.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Additional */}
          <section className="rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold">Additional Info</h3>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Assignment Submissions</div>
              <ul className="space-y-1.5">
                {student.assignments.map((a) => {
                  const cls = a.status === "Submitted" ? "bg-green-100 text-green-700" : a.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
                  return (
                    <li key={a.title} className="flex items-center justify-between text-sm">
                      <span>{a.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${cls}`}>{a.status}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Faculty Remarks</div>
              <p className="text-sm leading-relaxed bg-muted/40 rounded-md p-3">{student.remarks}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
