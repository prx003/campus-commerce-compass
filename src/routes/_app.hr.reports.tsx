import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2, Download, FileText, Users, CalendarCheck, Wallet, Gauge } from "lucide-react";
import { PageHeader, Section } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/hr/layout";
import { useHR, computePayroll } from "@/components/hr/store";
import { exportCSV, exportPDF } from "@/components/hr/export";

export const Route = createFileRoute("/_app/hr/reports")({
  component: () => (
    <ModuleGuard module="reports">
      <Reports />
    </ModuleGuard>
  ),
});

function Reports() {
  const { employees, attendance, leaves, evaluations } = useHR();
  const nameOf = (id: string) => employees.find((e) => e.id === id)?.name ?? id;

  const reports = [
    {
      key: "employees",
      title: "Employee Report",
      desc: "Full directory with roles, departments and salaries",
      icon: Users,
      headers: ["ID", "Name", "Role", "Department", "Status", "Salary"],
      rows: employees.map((e) => [e.id, e.name, e.role, e.dept, e.status, e.salary]),
    },
    {
      key: "attendance",
      title: "Attendance Report",
      desc: "Today's attendance status for all employees",
      icon: CalendarCheck,
      headers: ["ID", "Name", "Department", "Status"],
      rows: employees.map((e) => [e.id, e.name, e.dept, attendance[e.id] ?? "Absent"]),
    },
    {
      key: "leave",
      title: "Leave Report",
      desc: "All leave requests with status and duration",
      icon: CalendarCheck,
      headers: ["Employee", "Type", "From", "To", "Days", "Status"],
      rows: leaves.map((l) => [nameOf(l.empId), l.type, l.from, l.to, l.days, l.status]),
    },
    {
      key: "payroll",
      title: "Payroll Report",
      desc: "Gross, deductions and net pay per employee",
      icon: Wallet,
      headers: ["ID", "Name", "Gross", "Deductions", "Net"],
      rows: employees.map((e) => {
        const p = computePayroll(e);
        return [e.id, e.name, p.gross, p.deductions, p.net];
      }),
    },
    {
      key: "performance",
      title: "Performance Report",
      desc: "KPI and goal achievement per evaluation",
      icon: Gauge,
      headers: ["Employee", "Period", "KPI %", "Goals %", "Rating"],
      rows: evaluations.map((e) => [nameOf(e.empId), e.period, e.kpi, e.goals, e.rating]),
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Generate and download HR reports (Excel / PDF)" />

      <Section title="Available reports">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.key} className="rounded-lg border border-border p-4 flex items-start gap-3">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{r.title}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportCSV(r.key, [...r.headers], r.rows.map((row) => [...row]))}>
                      <Download className="size-4" /> Excel
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportPDF(r.title, [...r.headers], r.rows.map((row) => [...row]))}>
                      <FileText className="size-4" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Stat icon={Users} label="Employees" value={employees.length} />
          <Stat icon={CalendarCheck} label="Present today" value={Object.values(attendance).filter((s) => s === "Present").length} />
          <Stat icon={FileBarChart2} label="Leave requests" value={leaves.length} />
          <Stat icon={Gauge} label="Evaluations" value={evaluations.length} />
        </div>
      </Section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3 flex items-center gap-3">
      <Icon className="size-5 text-primary" />
      <div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
