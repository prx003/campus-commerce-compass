import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Download, FileText, X } from "lucide-react";
import { PageHeader, Section, StatCard } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { ModuleGuard } from "@/components/hr/layout";
import { useHR, computePayroll, inr, type Employee } from "@/components/hr/store";
import { exportCSV, exportPDF } from "@/components/hr/export";

export const Route = createFileRoute("/_app/hr/payroll")({
  component: () => (
    <ModuleGuard module="payroll">
      <Payroll />
    </ModuleGuard>
  ),
});

function Payroll() {
  const { employees } = useHR();
  const [slip, setSlip] = useState<Employee | null>(null);
  const cycle = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const totals = employees.reduce(
    (acc, e) => {
      const p = computePayroll(e);
      acc.gross += p.gross;
      acc.ded += p.deductions;
      acc.net += p.net;
      return acc;
    },
    { gross: 0, ded: 0, net: 0 },
  );

  const exportRows = employees.map((e) => {
    const p = computePayroll(e);
    return [e.id, e.name, e.dept, p.gross, p.basic, p.hra, p.allowances, p.deductions, p.net];
  });
  const headers = ["ID", "Name", "Dept", "Gross", "Basic", "HRA", "Allowances", "Deductions", "Net"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        subtitle={`Payroll cycle · ${cycle}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportCSV(`payroll-${cycle}`, headers, exportRows)}><Download className="size-4" /> Excel</Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => exportPDF(`Payroll Report — ${cycle}`, headers, exportRows)}><FileText className="size-4" /> PDF</Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Gross payroll" value={inr(totals.gross)} icon={Wallet} />
        <StatCard label="Deductions" value={inr(totals.ded)} icon={Wallet} accent="destructive" />
        <StatCard label="Net payable" value={inr(totals.net)} icon={Wallet} accent="success" />
      </div>

      <Section title="Salary register">
        <div className="overflow-x-auto -m-5">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Employee</th>
                <th className="px-3 py-3 text-right font-medium">Basic</th>
                <th className="px-3 py-3 text-right font-medium">HRA</th>
                <th className="px-3 py-3 text-right font-medium">Allowances</th>
                <th className="px-3 py-3 text-right font-medium">Deductions</th>
                <th className="px-3 py-3 text-right font-medium">Net</th>
                <th className="px-5 py-3 text-right font-medium">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const p = computePayroll(e);
                return (
                  <tr key={e.id} className="border-t border-border hover:bg-secondary/40">
                    <td className="px-5 py-3 font-medium">{e.name}<div className="text-[11px] text-muted-foreground">{e.dept}</div></td>
                    <td className="px-3 py-3 text-right tabular-nums">{inr(p.basic)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{inr(p.hra)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{inr(p.allowances)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-destructive">-{inr(p.deductions)}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums">{inr(p.net)}</td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSlip(e)}>View</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {slip && <Payslip employee={slip} cycle={cycle} onClose={() => setSlip(null)} />}
    </div>
  );
}

function Payslip({ employee, cycle, onClose }: { employee: Employee; cycle: string; onClose: () => void }) {
  const p = computePayroll(employee);
  const row = (label: string, value: number, neg = false) => (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium tabular-nums ${neg ? "text-destructive" : ""}`}>{neg ? "-" : ""}{inr(value)}</span>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold">Payslip</h3>
          <button onClick={onClose} className="size-8 grid place-items-center rounded hover:bg-secondary"><X className="size-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{cycle} · {employee.name} ({employee.id})</p>
        <div className="rounded-lg border border-border p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Earnings</div>
          {row("Basic", p.basic)}
          {row("HRA", p.hra)}
          {row("Allowances", p.allowances)}
          <div className="border-t border-border my-2" />
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Deductions</div>
          {row("Provident Fund", p.pf, true)}
          {row("Tax (TDS)", p.tax, true)}
          <div className="border-t border-border my-2" />
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold">Net pay</span>
            <span className="text-lg font-bold tabular-nums">{inr(p.net)}</span>
          </div>
        </div>
        <Button className="w-full mt-4 gap-1.5" onClick={() => exportPDF(`Payslip — ${employee.name} (${cycle})`, ["Component", "Amount (INR)"], [["Basic", p.basic], ["HRA", p.hra], ["Allowances", p.allowances], ["Provident Fund", -p.pf], ["Tax (TDS)", -p.tax], ["Net Pay", p.net]])}>
          <FileText className="size-4" /> Download PDF
        </Button>
      </div>
    </div>
  );
}
