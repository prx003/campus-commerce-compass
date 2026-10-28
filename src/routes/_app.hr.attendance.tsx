import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Download } from "lucide-react";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/hr/layout";
import { useHR, type AttStatus } from "@/components/hr/store";
import { exportCSV } from "@/components/hr/export";

export const Route = createFileRoute("/_app/hr/attendance")({
  component: () => (
    <ModuleGuard module="attendance">
      <Attendance />
    </ModuleGuard>
  ),
});

const STATUSES: AttStatus[] = ["Present", "Absent", "Leave"];
const colors: Record<AttStatus, string> = {
  Present: "bg-success/10 text-success",
  Absent: "bg-destructive/10 text-destructive",
  Leave: "bg-warning/15 text-warning-foreground",
};

function Attendance() {
  const { employees, attendance, setAttendance } = useHR();
  const present = Object.values(attendance).filter((s) => s === "Present").length;
  const absent = Object.values(attendance).filter((s) => s === "Absent").length;
  const leave = Object.values(attendance).filter((s) => s === "Leave").length;
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const download = () =>
    exportCSV(
      `attendance-${new Date().toISOString().slice(0, 10)}`,
      ["Employee ID", "Name", "Department", "Status", "Date"],
      employees.map((e) => [e.id, e.name, e.dept, attendance[e.id] ?? "Absent", today]),
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        subtitle={`Daily tracking · ${today}`}
        actions={<Button size="sm" variant="outline" className="gap-1.5" onClick={download}><Download className="size-4" /> Export report</Button>}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Present" value={String(present)} icon={CalendarCheck} accent="success" />
        <StatCard label="Absent" value={String(absent)} icon={CalendarCheck} accent="destructive" />
        <StatCard label="On leave" value={String(leave)} icon={CalendarCheck} accent="warning" />
      </div>

      <Section title="Mark attendance">
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Employee</th>
                <th className="px-3 py-3 text-left font-medium">Department</th>
                <th className="px-3 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Mark</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const status = attendance[e.id] ?? "Absent";
                return (
                  <tr key={e.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{e.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{e.dept}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${colors[status]}`}>{status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => setAttendance(e.id, s)}
                            className={`text-[11px] font-medium px-2 py-1 rounded border transition ${status === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary"}`}
                          >
                            {s}
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
      </Section>
    </div>
  );
}
