import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { COURSES, YEARS, STUDENTS, type Course, type Year, type Student } from "@/components/academic/data";
import { StudentDetail } from "@/components/academic/student-detail";

export const Route = createFileRoute("/_app/academic/students")({
  component: AcademicStudents,
});

function AcademicStudents() {
  const [course, setCourse] = useState<Course | null>(null);
  const [year, setYear] = useState<Year | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    if (!course || !year) return [];
    const q = query.trim().toLowerCase();
    return STUDENTS.filter(
      (s) =>
        s.course === course &&
        s.year === year &&
        (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)),
    );
  }, [course, year, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage student records by course and year</p>
      </div>

      <div className="rounded-xl bg-card border border-border p-5 space-y-4 shadow-sm">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Course</div>
          <div className="flex flex-wrap gap-2">
            {COURSES.map((c) => (
              <button
                key={c}
                onClick={() => { setCourse(c); setYear(null); setSelected(null); }}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition",
                  course === c ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border hover:bg-muted",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {course && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Year</div>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => { setYear(y); setSelected(null); }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition",
                    year === y ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border hover:bg-muted",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {course && year && (
          <div className="pt-2 border-t border-border">
            <div className="relative max-w-sm">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or student ID"
                className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        {!course || !year ? (
          <div className="py-20 text-center">
            <div className="text-sm text-muted-foreground">Select a course and year to view students</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">No students match your search.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Student No</th>
                <th className="px-3 py-3 text-left font-medium">Student Name</th>
                <th className="px-3 py-3 text-left font-medium">Email</th>
                <th className="px-3 py-3 text-left font-medium">Course</th>
                <th className="px-3 py-3 text-left font-medium">Year</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  onDoubleClick={() => setDetail(s)}
                  className={cn(
                    "border-t border-border cursor-pointer transition",
                    selected === s.id ? "bg-primary/8" : "hover:bg-muted/40",
                  )}
                >
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{s.id}</td>
                  <td
                    className="px-3 py-3 font-medium"
                    onDoubleClick={(e) => { e.stopPropagation(); setDetail(s); }}
                  >
                    {s.name}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-3 py-3">{s.course}</td>
                  <td className="px-3 py-3">{s.year}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetail(s); }}
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {detail && <StudentDetail student={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
